-- ============================================================================
-- 0001_curation_workspace.sql
-- Stage A, Task 1: the curation workspace database.
--
-- This file creates the five tables the curation workspace runs on, the status
-- checks that keep bad values out, and row-level security on every table. It is
-- the whole database for this phase. There are no screens or forms yet; those
-- come in Tasks 2 and 3.
--
-- How to run it: open your Supabase project, go to the SQL editor, paste this
-- whole file, and run it once. Running it again is safe; every statement guards
-- against the object already existing.
--
-- Field names match the app's existing schema (data/towns/schema.ts) so the
-- workspace and the resident-facing record speak the same language:
--   body_id      matches Body.id     ("council", "planning", "zba", ...)
--   type         matches AgendaItemType ("hearing", "action", ...)
--   vote_roll    matches VoteEntry[] ([{ "name": ..., "vote": ... }, ...])
-- ============================================================================

-- gen_random_uuid() lives in pgcrypto. Supabase enables it by default; this is
-- here so the file also works on a bare Postgres.
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- meetings
-- One row per meeting the team is covering. coverage_status walks a meeting
-- from untouched to published, one honest step at a time.
-- ----------------------------------------------------------------------------
create table if not exists public.meetings (
  id              uuid primary key default gen_random_uuid(),
  body_id         text not null,
  title           text not null,
  date            date,
  time            text,
  coverage_status text not null default 'not_started'
                    check (coverage_status in (
                      'not_started',
                      'agenda_captured',
                      'minutes_captured',
                      'summary_drafted',
                      'summary_reviewed',
                      'published'
                    )),
  submitted_by    text,
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- agenda_items
-- The items on a meeting's agenda. An item can carry the raw source text it was
-- captured from, a video timestamp, and a recorded vote.
-- ----------------------------------------------------------------------------
create table if not exists public.agenda_items (
  id              uuid primary key default gen_random_uuid(),
  meeting_id      uuid references public.meetings(id),
  title           text not null,
  type            text check (type in (
                    'hearing',
                    'action',
                    'presentation',
                    'discussion'
                  )),
  raw_source_text text,
  video_timestamp text,
  vote_result     text,
  vote_roll       jsonb,
  thread_id       text,
  submitted_by    text,
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- summary_drafts
-- A written recap of one agenda item, and the review it went through. In this
-- phase only people write drafts (drafted_by = 'human'); the 'ai' value exists
-- so a later phase can record machine drafts without a schema change.
-- ----------------------------------------------------------------------------
create table if not exists public.summary_drafts (
  id             uuid primary key default gen_random_uuid(),
  agenda_item_id uuid references public.agenda_items(id),
  draft_text     text,
  drafted_by     text check (drafted_by in ('human', 'ai')),
  drafter_name   text,
  status         text not null default 'pending_review'
                   check (status in ('pending_review', 'approved', 'rejected')),
  review_type    text check (review_type in ('independent', 'self')),
  reviewer_name  text,
  reviewed_at    timestamptz,
  rejection_note text,
  created_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- verification_log_entries
-- What happened after a flagged point was checked against its source. outcome
-- is 'corrected' when the recap was fixed, or 'stands' when it matched.
-- ----------------------------------------------------------------------------
create table if not exists public.verification_log_entries (
  id               uuid primary key default gen_random_uuid(),
  claim_text       text not null,
  outcome          text check (outcome in ('corrected', 'stands')),
  source_reference text,
  resolved_at      timestamptz,
  created_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- team_members
-- The small number of trusted people who use the workspace, and the role each
-- one holds. An admin fills this in by hand for now, right here in Supabase.
-- ----------------------------------------------------------------------------
create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text check (role in ('scout', 'curator', 'admin')),
  email      text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row-level security
--
-- Every table is locked down. For this phase there is no public-facing access
-- at all, so the simplest correct rule is: only a signed-in Supabase project
-- collaborator can read or write. Access is handed out through Supabase's own
-- collaborator invites in the dashboard, not through any login we build.
--
-- These are deliberately coarse. Fine-grained, per-role rules (a scout can do
-- this, a curator can do that) wait until Task 2's screens show exactly which
-- role needs which access. That is a chosen simplification for this phase, not
-- an oversight.
-- ============================================================================

alter table public.meetings                 enable row level security;
alter table public.agenda_items             enable row level security;
alter table public.summary_drafts           enable row level security;
alter table public.verification_log_entries enable row level security;
alter table public.team_members             enable row level security;

-- One read/write policy per table for authenticated collaborators. Each policy
-- is dropped first so this file can be re-run without error.
drop policy if exists "Authenticated read/write" on public.meetings;
create policy "Authenticated read/write" on public.meetings
  for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated read/write" on public.agenda_items;
create policy "Authenticated read/write" on public.agenda_items
  for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated read/write" on public.summary_drafts;
create policy "Authenticated read/write" on public.summary_drafts
  for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated read/write" on public.verification_log_entries;
create policy "Authenticated read/write" on public.verification_log_entries
  for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated read/write" on public.team_members;
create policy "Authenticated read/write" on public.team_members
  for all to authenticated using (true) with check (true);
