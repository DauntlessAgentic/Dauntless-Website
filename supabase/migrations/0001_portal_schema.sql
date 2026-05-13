-- ============================================================
-- Dauntless Agentic — Client Intelligence Portal
-- Migration 0001: core schema
--
-- Mirrors lib/portal/types.ts.  Tables, columns, and check
-- constraints are kept 1:1 with the TypeScript domain model so
-- the repository layer (lib/portal/repositories/*) can swap
-- between mock and real backends without UI changes.
--
-- Conventions
-- - All ids are TEXT (matching the mock data; gen_random_uuid()
--   can be used at insert time for new rows).
-- - Timestamps are TIMESTAMPTZ.
-- - Junction relationships (decision↔evidence, etc.) are stored
--   as TEXT[] arrays on the parent for v1.  Normalize in a
--   future migration if cardinality grows.
-- - updated_at is maintained by trigger; created_at defaults to now().
-- - Soft-delete via deleted_at; the repository layer filters it.
-- ============================================================

-- ── Utilities ───────────────────────────────────────────────
create extension if not exists pgcrypto;

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── Organization & Workspace ────────────────────────────────
create table if not exists organizations (
  id            text primary key,
  name          text not null,
  short_name    text not null,
  sector        text not null,
  region        text not null,
  trust_tier    text not null check (trust_tier in ('standard','elevated','restricted')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create trigger organizations_updated_at before update on organizations
  for each row execute function set_updated_at();

create table if not exists workspaces (
  id              text primary key,
  org_id          text not null references organizations(id),
  name            text not null,
  visibility      text not null check (visibility in ('private','partner','public')),
  trust_badge     text not null,
  primary_contact text not null,
  last_updated    timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists workspaces_org_id_idx on workspaces (org_id);
create trigger workspaces_updated_at before update on workspaces
  for each row execute function set_updated_at();

create table if not exists memberships (
  user_id       text not null,
  user_name     text not null,
  role          text not null check (role in ('owner','executive','lead','viewer','auditor')),
  workspace_id  text not null references workspaces(id),
  joined_at     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  primary key (user_id, workspace_id)
);
create index if not exists memberships_workspace_idx on memberships (workspace_id);
create trigger memberships_updated_at before update on memberships
  for each row execute function set_updated_at();

-- ── Engagements ─────────────────────────────────────────────
create table if not exists engagements (
  id                 text primary key,
  workspace_id       text not null references workspaces(id),
  name               text not null,
  kind               text not null check (kind in ('discovery','design','build','activate','advisory')),
  phase              text not null check (phase in ('discovery','design','deliver','activate','compound')),
  status             text not null check (status in ('active','review','blocked','complete','paused')),
  service            text not null check (service in ('consulting','training','agentic')),
  started_at         timestamptz not null,
  target_close_at    timestamptz not null,
  progress           integer not null check (progress between 0 and 100),
  success_criteria   text[] not null default '{}',
  risks              text[] not null default '{}',
  owner_name         text not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);
create index if not exists engagements_workspace_idx on engagements (workspace_id);
create trigger engagements_updated_at before update on engagements
  for each row execute function set_updated_at();

-- ── Artifacts & Versions ────────────────────────────────────
create table if not exists artifacts (
  id                   text primary key,
  engagement_id        text not null references engagements(id),
  name                 text not null,
  type                 text not null check (type in (
                         'roadmap','framework','blueprint','curriculum','briefing',
                         'decision-architecture','knowledge-map','activation-plan',
                         'risk-register','impact-report')),
  description          text not null,
  owner_name           text not null,
  review_state         text not null check (review_state in ('draft','in-review','approved','needs-revision','superseded')),
  current_version_id   text not null,
  linked_decision_ids  text[] not null default '{}',
  linked_evidence_ids  text[] not null default '{}',
  last_reviewed_at     timestamptz not null,
  canonical            boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz
);
create index if not exists artifacts_engagement_idx on artifacts (engagement_id);
create index if not exists artifacts_canonical_idx on artifacts (canonical) where canonical;
create trigger artifacts_updated_at before update on artifacts
  for each row execute function set_updated_at();

create table if not exists artifact_versions (
  id            text primary key,
  artifact_id   text not null references artifacts(id),
  version       text not null,           -- semver-ish; not enforced
  summary       text not null,
  changed_by    text not null,
  changed_at    timestamptz not null,
  created_at    timestamptz not null default now()
  -- versions are append-only; no updated_at or deleted_at
);
create index if not exists artifact_versions_artifact_idx on artifact_versions (artifact_id);

-- ── Decisions ───────────────────────────────────────────────
create table if not exists decisions (
  id                          text primary key,
  engagement_id               text not null references engagements(id),
  title                       text not null,
  status                      text not null check (status in (
                                'pending-approval','approved','deferred','rejected','superseded')),
  risk_tier                   text not null check (risk_tier in ('low','medium','high')),
  due_at                      timestamptz,
  decided_at                  timestamptz,
  decided_by                  text,
  recommendation_summary      text not null,
  recommendation_rationale    text not null,
  recommendation_options      jsonb not null default '[]',  -- [{label, description, isDefault}]
  recommendation_default      text not null,
  recommendation_confidence   numeric(4,3) not null check (recommendation_confidence between 0 and 1),
  evidence_ids                text[] not null default '{}',
  artifact_ids                text[] not null default '{}',
  proposed_by                 text not null,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  deleted_at                  timestamptz
);
create index if not exists decisions_engagement_idx on decisions (engagement_id);
create index if not exists decisions_status_idx on decisions (status);
create trigger decisions_updated_at before update on decisions
  for each row execute function set_updated_at();

-- ── Tasks ───────────────────────────────────────────────────
create table if not exists tasks (
  id              text primary key,
  engagement_id   text not null references engagements(id),
  title           text not null,
  status          text not null check (status in ('todo','in-progress','blocked','complete')),
  phase           text not null check (phase in ('discovery','design','deliver','activate','compound')),
  owner_name      text not null,
  progress        integer not null check (progress between 0 and 100),
  due_at          timestamptz,
  is_milestone    boolean not null default false,
  blocked_reason  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists tasks_engagement_idx on tasks (engagement_id);
create trigger tasks_updated_at before update on tasks
  for each row execute function set_updated_at();

-- ── Signals ─────────────────────────────────────────────────
create table if not exists signals (
  id              text primary key,
  workspace_id    text not null references workspaces(id),
  engagement_id   text references engagements(id),
  kind            text not null check (kind in (
                    'artifact-updated','decision-proposed','decision-decided',
                    'milestone-hit','risk-raised','agent-action',
                    'knowledge-promoted','metric-shift')),
  severity        text not null check (severity in ('info','notable','important','urgent')),
  title           text not null,
  detail          text not null,
  source          text not null,
  ref_id          text,
  captured_at     timestamptz not null,
  created_at      timestamptz not null default now()
);
create index if not exists signals_workspace_captured_idx on signals (workspace_id, captured_at desc);

-- ── Agents & Conversations ──────────────────────────────────
create table if not exists agents (
  id                       text primary key,
  workspace_id             text not null references workspaces(id),
  name                     text not null,
  archetype                text not null check (archetype in ('strategist','operator','auditor','chief-of-staff')),
  role                     text not null,
  state                    text not null check (state in ('idle','active','thinking','blocked','complete','updated')),
  model                    text not null,
  scope                    text[] not null default '{}',  -- engagement ids
  tools                    text[] not null default '{}',
  decisions_touched        integer not null default 0,
  conversations_last_7d    integer not null default 0,
  last_active_at           timestamptz not null,
  example_questions        text[] not null default '{}',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  deleted_at               timestamptz
);
create index if not exists agents_workspace_idx on agents (workspace_id);
create trigger agents_updated_at before update on agents
  for each row execute function set_updated_at();

create table if not exists conversations (
  id              text primary key,
  agent_id        text not null references agents(id),
  workspace_id    text not null references workspaces(id),
  title           text not null,
  last_turn_at    timestamptz not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists conversations_agent_idx on conversations (agent_id);
create index if not exists conversations_workspace_idx on conversations (workspace_id);
create trigger conversations_updated_at before update on conversations
  for each row execute function set_updated_at();

create table if not exists conversation_messages (
  id                text primary key,
  conversation_id   text not null references conversations(id),
  role              text not null check (role in ('user','assistant')),
  agent_id          text references agents(id),
  content           text not null,
  ts                timestamptz not null,
  created_at        timestamptz not null default now()
  -- messages are append-only
);
create index if not exists conversation_messages_conv_idx on conversation_messages (conversation_id, ts);

-- ── Knowledge ───────────────────────────────────────────────
create table if not exists knowledge_items (
  id                 text primary key,
  workspace_id       text not null references workspaces(id),
  title              text not null,
  shelf              text not null check (shelf in ('desk','bookshelf','cabinet')),
  memory_tier        text not null check (memory_tier in ('M0','M1','M2','M3','M4')),
  confidence         numeric(4,3) not null check (confidence between 0 and 1),
  freshness          text not null check (freshness in ('fresh','aging','stale')),
  source             text not null,
  source_kind        text not null check (source_kind in ('artifact','decision','conversation','external','playbook')),
  canonical          boolean not null default false,
  promoted_at        timestamptz,
  last_validated_at  timestamptz not null,
  summary            text not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);
create index if not exists knowledge_workspace_shelf_idx on knowledge_items (workspace_id, shelf);
create trigger knowledge_items_updated_at before update on knowledge_items
  for each row execute function set_updated_at();

-- ── Metrics ─────────────────────────────────────────────────
create table if not exists metrics (
  id              text primary key,
  workspace_id    text not null references workspaces(id),
  key             text not null,
  label           text not null,
  unit            text not null check (unit in ('percent','days','score','count','ratio')),
  current         numeric not null,
  baseline        numeric not null,
  target          numeric not null,
  trend           text not null check (trend in ('up','down','flat')),
  trend_value     text not null,
  series          jsonb not null default '[]',  -- [{period, value}]
  narrative       text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index if not exists metrics_workspace_key_idx on metrics (workspace_id, key);
create trigger metrics_updated_at before update on metrics
  for each row execute function set_updated_at();

-- ── Evidence ────────────────────────────────────────────────
create table if not exists evidence (
  id              text primary key,
  workspace_id    text not null references workspaces(id),
  kind            text not null check (kind in ('artifact','metric','signal','source','workflow-log')),
  ref_id          text not null,
  title           text not null,
  snippet         text not null,
  source          text not null,
  captured_at     timestamptz not null,
  created_at      timestamptz not null default now()
);
create index if not exists evidence_workspace_idx on evidence (workspace_id);

-- ── Next-best-actions (cached recommendations) ──────────────
create table if not exists next_best_actions (
  id                 text primary key,
  workspace_id       text not null references workspaces(id),
  label              text not null,
  rationale          text not null,
  engagement_id      text references engagements(id),
  estimated_effort   text not null check (estimated_effort in ('minutes','hours','days')),
  priority           text not null check (priority in ('primary','secondary')),
  ordering           integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists next_best_actions_workspace_idx on next_best_actions (workspace_id, ordering);
create trigger next_best_actions_updated_at before update on next_best_actions
  for each row execute function set_updated_at();

-- ── Audit log (append-only) ─────────────────────────────────
create table if not exists audit_log (
  id              text primary key default gen_random_uuid()::text,
  workspace_id    text not null references workspaces(id),
  action          text not null check (action in (
                    'decision-approved','decision-rejected','decision-deferred',
                    'artifact-published','artifact-superseded','agent-run',
                    'access-granted','access-revoked','evidence-exported')),
  actor           text not null,
  actor_kind      text not null check (actor_kind in ('human','agent')),
  ref_id          text,
  detail          text not null,
  risk_tier       text not null check (risk_tier in ('low','medium','high')),
  at              timestamptz not null default now(),
  created_at      timestamptz not null default now()
  -- audit log is strictly append-only: no updated_at, no deleted_at
);
create index if not exists audit_log_workspace_at_idx on audit_log (workspace_id, at desc);

-- ── Comments ────────────────────────────────────────────────
comment on table organizations is 'Tenant boundary. Government dept, enterprise, or partner.';
comment on table workspaces is 'One per organization (initially). Visibility / governance boundary.';
comment on table memberships is 'User x workspace x role. Drives RLS in migration 0002.';
comment on table engagements is 'A sprint or program with success criteria, phase, and status.';
comment on table artifacts is 'Living deliverables. Versions are immutable; the artifact is the canonical handle.';
comment on table artifact_versions is 'Append-only point-in-time snapshots of an artifact.';
comment on table decisions is 'Points requiring human judgment. Drives the Decision Surface.';
comment on table tasks is 'Execution tracking against the engagement plan.';
comment on table signals is 'Notable changes worth surfacing in the "What changed?" feed.';
comment on table agents is 'Contextual AI agents serving the workspace. Maps to the four archetypes.';
comment on table conversations is 'Threads between client and an agent (or between agents).';
comment on table conversation_messages is 'Append-only messages on a conversation thread.';
comment on table knowledge_items is 'Knowledge with provenance and freshness, shelved Desk/Bookshelf/Cabinet.';
comment on table metrics is 'Measured outcomes with series; current vs baseline vs target.';
comment on table evidence is 'Anything that justifies a decision or recommendation.';
comment on table next_best_actions is 'Ranked recommendations for the Command Center.';
comment on table audit_log is 'Append-only audit trail. Never UPDATE or DELETE.';
