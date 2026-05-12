// ============================================================
// Connector catalog (Phase 11.0)
//
// Pre-built outbound connectors with capability declarations.
// Each connector's `connected` flag is read from env vars so the
// surface can show real wiring status without hard-coding.
// ============================================================

import type { ConnectorDefinition } from "./types";

export function listConnectors(env: NodeJS.ProcessEnv = process.env): ConnectorDefinition[] {
  return [
    {
      id: "hubspot",
      label: "HubSpot",
      category: "crm",
      connected: Boolean(env.HUBSPOT_API_KEY),
      capabilities: [
        {
          id: "create-deal",
          label: "Create deal",
          description: "Create a new deal under the workspace pipeline.",
          scope: "deals (write)",
          defaultRiskTier: "medium",
          supportsDryRun: true,
          reversible: true,
        },
        {
          id: "update-contact",
          label: "Update contact",
          description: "Patch a contact record with new properties.",
          scope: "contacts (write)",
          defaultRiskTier: "low",
          supportsDryRun: true,
          reversible: true,
        },
      ],
    },
    {
      id: "salesforce",
      label: "Salesforce",
      category: "crm",
      connected: Boolean(env.SALESFORCE_INSTANCE_URL && env.SALESFORCE_ACCESS_TOKEN),
      capabilities: [
        {
          id: "create-opportunity",
          label: "Create opportunity",
          description: "Open a new opportunity tied to an account.",
          scope: "Opportunity (write)",
          defaultRiskTier: "medium",
          supportsDryRun: true,
          reversible: true,
        },
        {
          id: "log-activity",
          label: "Log activity",
          description: "Record a Task or Event against a record.",
          scope: "Task, Event (write)",
          defaultRiskTier: "low",
          supportsDryRun: true,
          reversible: true,
        },
      ],
    },
    {
      id: "jira",
      label: "Jira",
      category: "ticketing",
      connected: Boolean(env.JIRA_BASE_URL && env.JIRA_API_TOKEN),
      capabilities: [
        {
          id: "create-issue",
          label: "Create issue",
          description: "Open a Jira issue under a project + epic.",
          scope: "issue (write)",
          defaultRiskTier: "low",
          supportsDryRun: true,
          reversible: true,
        },
        {
          id: "comment-issue",
          label: "Comment on issue",
          description: "Post a comment on an existing issue.",
          scope: "issue.comment (write)",
          defaultRiskTier: "low",
          supportsDryRun: true,
          reversible: false,
        },
      ],
    },
    {
      id: "servicenow",
      label: "ServiceNow",
      category: "ticketing",
      connected: Boolean(env.SERVICENOW_INSTANCE && env.SERVICENOW_TOKEN),
      capabilities: [
        {
          id: "create-incident",
          label: "Create incident",
          description: "File an incident record under the workspace category.",
          scope: "incident (write)",
          defaultRiskTier: "medium",
          supportsDryRun: true,
          reversible: true,
        },
        {
          id: "escalate-incident",
          label: "Escalate incident",
          description: "Bump priority + reassign to an on-call group.",
          scope: "incident (write)",
          defaultRiskTier: "high",
          supportsDryRun: true,
          reversible: true,
        },
      ],
    },
    {
      id: "ms-graph",
      label: "Microsoft 365 (Graph)",
      category: "calendar",
      connected: Boolean(env.MS_GRAPH_CLIENT_ID),
      capabilities: [
        {
          id: "create-event",
          label: "Create calendar event",
          description: "Schedule a meeting on the requesting member's calendar.",
          scope: "Calendars.ReadWrite",
          defaultRiskTier: "low",
          supportsDryRun: true,
          reversible: true,
        },
        {
          id: "send-mail",
          label: "Send email",
          description: "Send a mail draft from the requesting member's mailbox.",
          scope: "Mail.Send",
          defaultRiskTier: "high",
          supportsDryRun: false,
          reversible: false,
        },
      ],
    },
    {
      id: "google-workspace",
      label: "Google Workspace",
      category: "calendar",
      connected: Boolean(env.GOOGLE_WORKSPACE_CREDENTIALS),
      capabilities: [
        {
          id: "create-event",
          label: "Create calendar event",
          description: "Schedule a meeting on the requesting member's primary calendar.",
          scope: "calendar.events (write)",
          defaultRiskTier: "low",
          supportsDryRun: true,
          reversible: true,
        },
      ],
    },
    {
      id: "internal",
      label: "Internal (portal)",
      category: "internal",
      connected: true,
      capabilities: [
        {
          id: "post-signal",
          label: "Post workspace signal",
          description: "Emit a custom Signal into the workspace 'What changed?' feed.",
          scope: "internal (signals.write)",
          defaultRiskTier: "low",
          supportsDryRun: true,
          reversible: true,
        },
      ],
    },
  ];
}

export function findCapability(connectorId: string, capabilityId: string) {
  const connector = listConnectors().find((c) => c.id === connectorId);
  if (!connector) return null;
  return connector.capabilities.find((c) => c.id === capabilityId) ?? null;
}
