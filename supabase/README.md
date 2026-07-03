# The curation workspace database

Commonwealth's resident-facing site is a static mirror of the public record. The
curation workspace is the private side: the small set of tables where a trusted
team captures meetings, drafts recaps, and logs what happened after a flag was
checked. This folder holds the database setup for that workspace.

This is Stage A, Task 1. It builds the database and its access model only. The
screens that read and write these tables come in Tasks 2 and 3.

## What is here

- `migrations/0001_curation_workspace.sql` is the whole database: five tables,
  the status checks that keep bad values out, and row-level security on every
  table.

The matching TypeScript lives in the app:

- `src/supabase.ts` is the one module that connects to Supabase. Everything
  that talks to the database goes through it.
- `src/curation/types.ts` is one TypeScript type per table.

## Set it up (about ten minutes, no terminal needed)

You need a free Supabase account and a project before you start. If you have not
made one yet, go to supabase.com, sign up, and create a new project. Give it any
name and pick a region close to Michigan. Wait for it to finish setting up, then
come back here.

### 1. Create the tables

1. In your Supabase project, open the **SQL editor** in the left sidebar.
2. Open `migrations/0001_curation_workspace.sql` from this folder, copy the
   whole file, and paste it into a new query.
3. Click **Run**. You should see a success message. This creates all five tables
   and turns on row-level security.
4. To check, open the **Table editor** in the sidebar. You should see
   `meetings`, `agenda_items`, `summary_drafts`, `verification_log_entries`, and
   `team_members`.

### 2. Copy your two connection values into the site

The site reaches the database with two values from your project.

1. In Supabase, open **Project Settings**, then **API**.
2. Copy the **Project URL**.
3. Copy the **anon public** key (the one labeled `anon` `public`).

Now put them where the deploy build can read them. This is the same place the
flag function's setting lives.

1. In the GitHub repo, go to **Settings**, then **Secrets and variables**, then
   **Actions**, then the **Variables** tab.
2. Add a repository variable named `SUPABASE_URL` set to the Project URL.
3. Add a repository variable named `SUPABASE_ANON_KEY` set to the anon public
   key.
4. The next deploy picks them up.

For running the site on your own computer instead, copy `.env.local.example` in
the repo root to `.env.local` and paste the same two values there. `.env.local`
is git-ignored, so your values never get committed.

The anon key is safe to publish. On its own it can do nothing, because
row-level security requires a signed-in project collaborator for every read and
write.

### 3. Invite the people who will use the workspace

There is no public sign-up anywhere. Access is handed out through Supabase's own
collaborator invites.

1. In Supabase, open **Project Settings**, then **Team**.
2. Invite each trusted person by email. Only invited collaborators can read or
   write any of these tables.

### 4. Record who is on the team

The `team_members` table is filled in by hand for now.

1. In Supabase, open the **Table editor** and pick `team_members`.
2. Click **Insert row** and add each person: their `name`, their `email`, and a
   `role` of `scout`, `curator`, or `admin`.

## A note on the row-level security in this phase

Every table is locked to signed-in project collaborators for both reading and
writing. These rules are deliberately coarse. Fine-grained, per-role rules (what
a scout may do versus a curator) wait until Task 2's screens show exactly which
role needs which access. That is a chosen simplification for this phase, not an
oversight.
