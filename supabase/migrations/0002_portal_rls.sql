-- ============================================================
-- Migration 0002: Row-Level Security
--
-- Membership-driven RLS policies. A user can see a workspace's
-- rows iff they have a row in memberships joining their auth.uid()
-- to that workspace.
--
-- Conventions
-- - auth.uid() resolves the current Supabase Auth subject.
-- - Owner / Auditor roles bypass nothing; they are gated by
--   policy predicates per table.
-- - Audit log is INSERT-only for everyone, SELECT for auditors
--   and workspace owners only.
-- - Soft-deleted rows (deleted_at is not null) are hidden by
--   policies that include a deleted_at filter.
--
-- Phase 2 ships this as a DRAFT.  We expect to refine it as soon
-- as we wire real OAuth in a follow-up PR.  Until that PR, the
-- repository factory defaults to the mock backend and these
-- policies are inert from the app's perspective.
-- ============================================================

-- ── Helper: does the current user have any role on a workspace? ──
create or replace function portal_has_membership(p_workspace_id text)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from memberships m
    where m.workspace_id = p_workspace_id
      and m.user_id = auth.uid()::text
      and m.deleted_at is null
  );
$$;

-- ── Helper: does the current user hold one of these roles? ──
create or replace function portal_has_role(p_workspace_id text, p_roles text[])
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from memberships m
    where m.workspace_id = p_workspace_id
      and m.user_id = auth.uid()::text
      and m.role = any(p_roles)
      and m.deleted_at is null
  );
$$;

-- ── Enable RLS ──────────────────────────────────────────────
alter table organizations          enable row level security;
alter table workspaces             enable row level security;
alter table memberships            enable row level security;
alter table engagements            enable row level security;
alter table artifacts              enable row level security;
alter table artifact_versions      enable row level security;
alter table decisions              enable row level security;
alter table tasks                  enable row level security;
alter table signals                enable row level security;
alter table agents                 enable row level security;
alter table conversations          enable row level security;
alter table conversation_messages  enable row level security;
alter table knowledge_items        enable row level security;
alter table metrics                enable row level security;
alter table evidence               enable row level security;
alter table next_best_actions      enable row level security;
alter table audit_log              enable row level security;

-- ── Organizations: visible if user has membership in any
--    workspace under that org.
create policy org_select on organizations for select
  using (
    exists (
      select 1 from workspaces w
      where w.org_id = organizations.id
        and portal_has_membership(w.id)
    )
  );

-- ── Workspaces: visible only to members ──
create policy workspaces_select on workspaces for select
  using (portal_has_membership(id));

-- ── Memberships: a user sees memberships for workspaces they're in ──
create policy memberships_select on memberships for select
  using (portal_has_membership(workspace_id));

-- Owners can grant/revoke memberships
create policy memberships_insert on memberships for insert
  with check (portal_has_role(workspace_id, array['owner']));
create policy memberships_update on memberships for update
  using (portal_has_role(workspace_id, array['owner']));

-- ── Per-workspace tables: same predicate over every entity ──
do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'engagements','signals','agents','conversations','conversation_messages',
      'knowledge_items','metrics','evidence','next_best_actions'
    ])
  loop
    execute format(
      'create policy %I on %I for select using (portal_has_membership(workspace_id))',
      tbl || '_select', tbl
    );
  end loop;
end$$;

-- engagements are indirected via workspace_id already (handled above).
-- Now the workspace-via-engagement tables (artifacts, decisions, tasks).
create policy artifacts_select on artifacts for select
  using (
    exists (
      select 1 from engagements e
      where e.id = artifacts.engagement_id
        and portal_has_membership(e.workspace_id)
    )
  );
create policy decisions_select on decisions for select
  using (
    exists (
      select 1 from engagements e
      where e.id = decisions.engagement_id
        and portal_has_membership(e.workspace_id)
    )
  );
create policy tasks_select on tasks for select
  using (
    exists (
      select 1 from engagements e
      where e.id = tasks.engagement_id
        and portal_has_membership(e.workspace_id)
    )
  );
create policy artifact_versions_select on artifact_versions for select
  using (
    exists (
      select 1 from artifacts a join engagements e on e.id = a.engagement_id
      where a.id = artifact_versions.artifact_id
        and portal_has_membership(e.workspace_id)
    )
  );

-- ── Write policies (lead and above) ──
do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'engagements','artifacts','artifact_versions','decisions','tasks',
      'signals','agents','conversations','conversation_messages',
      'knowledge_items','metrics','evidence','next_best_actions'
    ])
  loop
    execute format($f$
      create policy %I on %I for insert
        with check (
          case
            when %L = 'artifacts' or %L = 'decisions' or %L = 'tasks' or %L = 'artifact_versions'
              then exists (
                select 1 from engagements e
                where e.id = coalesce(new.engagement_id, (select engagement_id from artifacts where id = new.artifact_id))
                  and portal_has_role(e.workspace_id, array['owner','lead'])
              )
            else portal_has_role(coalesce(new.workspace_id, null), array['owner','lead'])
          end
        );
    $f$, tbl || '_insert', tbl, tbl, tbl, tbl, tbl);
  end loop;
exception when others then
  -- The dynamic case-statement above is best-effort.  When we
  -- harden Phase 2, each table gets a hand-rolled policy instead.
  raise notice 'Skipping bulk insert policies; hand-roll per table during the Phase 2 wire-up PR.';
end$$;

-- ── Audit log: insert-only for system; select for auditor/owner ──
create policy audit_log_select on audit_log for select
  using (portal_has_role(workspace_id, array['auditor','owner']));
create policy audit_log_insert on audit_log for insert
  with check (portal_has_membership(workspace_id));
-- No UPDATE or DELETE policy: the absence revokes those verbs.

comment on function portal_has_membership(text) is
  'RLS helper: does auth.uid() have any membership on the given workspace?';
comment on function portal_has_role(text, text[]) is
  'RLS helper: does auth.uid() hold any of the given roles on the workspace?';
