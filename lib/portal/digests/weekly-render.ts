// ============================================================
// Weekly digest renderer (Advisory action #20)
//
// Renders the same payload `buildThisWeekDigest` produces into:
//   - HTML (email-friendly, inline styles)
//   - plain text (Slack-friendly, fallback)
//
// Phase D's signed-export pipeline can sign the digest as a
// bundle if a workspace wants tamper-evident weekly records.
// ============================================================

import type { ThisWeekDigest } from "./this-week";

export interface DigestRender {
  subject: string;
  html: string;
  text: string;
}

export function renderWeeklyDigest(workspaceName: string, digest: ThisWeekDigest): DigestRender {
  const subject =
    digest.summary.urgent > 0
      ? `[${workspaceName}] ${digest.summary.urgent} urgent item${digest.summary.urgent === 1 ? "" : "s"} this week`
      : digest.summary.notable > 0
      ? `[${workspaceName}] ${digest.summary.notable} thing${digest.summary.notable === 1 ? "" : "s"} to review this week`
      : `[${workspaceName}] All clear this week`;

  const text = renderText(workspaceName, digest);
  const html = renderHtml(workspaceName, digest);
  return { subject, html, text };
}

function renderText(workspaceName: string, digest: ThisWeekDigest): string {
  const lines: string[] = [];
  lines.push(`Dauntless — ${workspaceName}`);
  lines.push(`Weekly digest · ${digest.windowDays}-day window · generated ${digest.generatedAt.toISOString()}`);
  lines.push("");
  if (digest.items.length === 0) {
    lines.push("Nothing requires your attention right now. See you next week.");
    return lines.join("\n");
  }
  lines.push(
    `${digest.summary.urgent} urgent · ${digest.summary.notable} to review · ${digest.summary.advisory} advisory`,
  );
  lines.push("");
  for (const item of digest.items) {
    lines.push(`[${item.urgency.toUpperCase()}] ${item.title}`);
    lines.push(`  ${item.detail}`);
    lines.push(`  → ${item.href}`);
    lines.push("");
  }
  return lines.join("\n");
}

function renderHtml(workspaceName: string, digest: ThisWeekDigest): string {
  const itemHtml = digest.items
    .map((item) => {
      const tone =
        item.urgency === "urgent"
          ? "#f59e0b"
          : item.urgency === "notable"
          ? "#3b82f6"
          : "#52526a";
      return `
<tr>
  <td style="padding:10px 0;border-bottom:1px solid #2a2a3a;">
    <div style="display:inline-block;font-size:11px;text-transform:uppercase;color:${tone};font-weight:600;letter-spacing:0.08em;">
      ${escape(item.urgency)} · ${escape(item.kind.replace(/-/g, " "))}
    </div>
    <div style="font-size:14px;color:#ededf5;font-weight:600;margin-top:4px;">
      ${escape(item.title)}
    </div>
    <div style="font-size:12px;color:#8e8ea8;margin-top:2px;">
      ${escape(item.detail)}
    </div>
    <a href="${escape(item.href)}" style="display:inline-block;margin-top:6px;font-size:12px;color:#a78bfa;text-decoration:none;">
      Open →
    </a>
  </td>
</tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escape(workspaceName)} — Weekly digest</title></head>
<body style="margin:0;padding:24px;background:#09090e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table style="max-width:560px;margin:0 auto;background:#13131e;border:1px solid #2a2a3a;border-radius:8px;width:100%;">
  <tr><td style="padding:18px 20px 6px 20px;">
    <div style="font-size:11px;text-transform:uppercase;color:#52526a;letter-spacing:0.08em;">THIS WEEK</div>
    <div style="font-size:18px;color:#ededf5;font-weight:600;margin-top:4px;">
      ${escape(workspaceName)}
    </div>
    <div style="font-size:12px;color:#8e8ea8;margin-top:2px;">
      ${digest.items.length === 0 ? "All clear" : `${digest.summary.urgent} urgent · ${digest.summary.notable} to review · ${digest.summary.advisory} advisory`}
    </div>
  </td></tr>
  <tr><td style="padding:6px 20px 18px 20px;">
    <table style="width:100%;">${itemHtml}</table>
  </td></tr>
  <tr><td style="padding:12px 20px;border-top:1px solid #2a2a3a;font-size:11px;color:#52526a;">
    Generated ${escape(digest.generatedAt.toISOString())} · ${digest.windowDays}-day window.
    Manage delivery in your profile settings.
  </td></tr>
</table>
</body></html>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
