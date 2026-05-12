// ============================================================
// Anthropic provider runtime (Phase 3)
//
// Thin wrapper around the Anthropic Messages API. No SDK
// dependency — we call the HTTP endpoint directly so the portal
// stays runtime-light. Patterns ported from CAIA
// `lib/providers/runtime-core.ts`.
//
// What's included:
//   - Prompt caching (cache_control: { type: "ephemeral" }) on the
//     system prompt + bookshelf block by default.
//   - Tool use (single-turn).
//   - Normalized error shapes that surface as ProviderRuntimeError.
//   - Token + cache-hit telemetry returned alongside the parsed
//     response so callers can persist it.
// ============================================================

// Server-only by convention (Next bundler will reject client imports via the
// "use server" actions that consume this). We don't use the `server-only`
// package because it throws under node:test; see tests/portal/*.mjs.

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MAX_TOKENS = 1_600;
const DEFAULT_TIMEOUT_MS = 30_000;

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

export type AnthropicContentBlock =
  | { type: "text"; text: string; cache_control?: { type: "ephemeral" } }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean };

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
}

export interface AnthropicToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface AnthropicSystemBlock {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
}

export interface AnthropicMessagesRequest {
  model: string;
  system: string | AnthropicSystemBlock[];
  messages: AnthropicMessage[];
  tools?: AnthropicToolDefinition[];
  max_tokens?: number;
  temperature?: number;
  /** Force a specific tool. Most useful for "you must propose a decision". */
  tool_choice?: { type: "any" } | { type: "tool"; name: string };
}

export interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}

export interface AnthropicMessagesResponse {
  id: string;
  model: string;
  stop_reason: string;
  content: AnthropicContentBlock[];
  usage: AnthropicUsage;
}

export class ProviderRuntimeError extends Error {
  readonly kind:
    | "auth-failed"
    | "rate-limited"
    | "model-unavailable"
    | "timeout"
    | "server-error"
    | "transport-error";
  readonly status?: number;
  readonly providerRequestId?: string;

  constructor(
    kind: ProviderRuntimeError["kind"],
    message: string,
    extras: { status?: number; providerRequestId?: string } = {},
  ) {
    super(message);
    this.name = "ProviderRuntimeError";
    this.kind = kind;
    this.status = extras.status;
    this.providerRequestId = extras.providerRequestId;
  }
}

export interface AnthropicCallOptions {
  apiKey: string;
  timeoutMs?: number;
  abortSignal?: AbortSignal;
}

export async function callAnthropicMessages(
  request: AnthropicMessagesRequest,
  options: AnthropicCallOptions,
): Promise<AnthropicMessagesResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  if (options.abortSignal) {
    options.abortSignal.addEventListener("abort", () => controller.abort(options.abortSignal!.reason), {
      once: true,
    });
  }

  const body = {
    model: request.model,
    system: request.system,
    messages: request.messages,
    max_tokens: request.max_tokens ?? DEFAULT_MAX_TOKENS,
    temperature: request.temperature ?? 0.2,
    ...(request.tools ? { tools: request.tools } : {}),
    ...(request.tool_choice ? { tool_choice: request.tool_choice } : {}),
  };

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": options.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("timeout")) {
      throw new ProviderRuntimeError("timeout", "Anthropic request timed out.");
    }
    throw new ProviderRuntimeError("transport-error", `Anthropic transport error: ${message}`);
  } finally {
    clearTimeout(timeout);
  }

  const providerRequestId =
    response.headers.get("request-id") ?? response.headers.get("anthropic-request-id") ?? undefined;

  if (!response.ok) {
    const detail = await safeReadErrorMessage(response);
    if (response.status === 401 || response.status === 403) {
      throw new ProviderRuntimeError("auth-failed", `Anthropic rejected credentials (${response.status}): ${detail}`, {
        status: response.status,
        providerRequestId,
      });
    }
    if (response.status === 404 || response.status === 400) {
      throw new ProviderRuntimeError("model-unavailable", `Anthropic ${response.status}: ${detail}`, {
        status: response.status,
        providerRequestId,
      });
    }
    if (response.status === 429) {
      throw new ProviderRuntimeError("rate-limited", `Anthropic rate-limited: ${detail}`, {
        status: response.status,
        providerRequestId,
      });
    }
    throw new ProviderRuntimeError("server-error", `Anthropic ${response.status}: ${detail}`, {
      status: response.status,
      providerRequestId,
    });
  }

  const parsed = (await response.json()) as AnthropicMessagesResponse;
  return parsed;
}

async function safeReadErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 400);
  } catch {
    return "<no body>";
  }
}

/**
 * Pricing per million tokens for the Anthropic models we care about.
 * Numbers from the public pricing page at the time Phase 3 shipped; update
 * when Anthropic changes pricing or when we add new models.
 */
const MODEL_PRICING_PER_MTOK: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  "claude-opus-4-7": { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
  "claude-opus-4-6": { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
  "claude-sonnet-4-6": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-haiku-4-5": { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
};

export interface UsageCost {
  inputUsd: number;
  outputUsd: number;
  cacheWriteUsd: number;
  cacheReadUsd: number;
  totalUsd: number;
  cacheHitRate: number;
}

export function costFromUsage(model: string, usage: AnthropicUsage): UsageCost {
  const pricing = MODEL_PRICING_PER_MTOK[model] ?? MODEL_PRICING_PER_MTOK["claude-sonnet-4-6"];
  const inputUsd = (usage.input_tokens / 1_000_000) * pricing.input;
  const outputUsd = (usage.output_tokens / 1_000_000) * pricing.output;
  const cacheWriteUsd = (usage.cache_creation_input_tokens / 1_000_000) * pricing.cacheWrite;
  const cacheReadUsd = (usage.cache_read_input_tokens / 1_000_000) * pricing.cacheRead;
  const totalUsd = inputUsd + outputUsd + cacheWriteUsd + cacheReadUsd;
  const totalInput = usage.input_tokens + usage.cache_read_input_tokens + usage.cache_creation_input_tokens;
  const cacheHitRate = totalInput === 0 ? 0 : usage.cache_read_input_tokens / totalInput;
  return { inputUsd, outputUsd, cacheWriteUsd, cacheReadUsd, totalUsd, cacheHitRate };
}
