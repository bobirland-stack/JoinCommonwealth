# Publishing one real Clawson meeting, end to end

This is the ordered path from an empty setup to a real meeting a resident can
read. Each step is a one-time setup or a repeatable action. The detailed
instructions for the setup pieces already live next to the code they configure;
this page is the map that puts them in order and names what depends on what.

The reading site works today without any of this. This runbook is only about
turning on the private curation pipeline that produces meeting entries, so the
team stops hand-editing `data/towns/clawson.json`.

## What has to be true before a meeting can publish

Three separate services back the pipeline, and each is empty until someone sets
it up. When a piece is not connected, the matching screen says so plainly rather
than pretending it works.

1. **Supabase** holds the private workspace tables. Until it is connected, the
   whole workspace shows "not connected yet" and no screen opens.
2. **The publish worker** is the one piece that can commit to the repository,
   because a static site cannot hold a GitHub token. Until it is connected, the
   publish screen loads but says it cannot publish yet.
3. **The deploy build** has to pass each service's URL into the site. This is
   the step most easily missed: the URL can be set as a repository variable and
   still not reach the site if the deploy workflow does not read it.

## Setup, in order (one time)

### 1. Connect Supabase

Follow `supabase/README.md`. In short: create the project, run the one
migration, set the `SUPABASE_URL` and `SUPABASE_ANON_KEY` repository variables,
invite the team as Supabase collaborators, and fill in `team_members` by hand.

The deploy workflow already reads both Supabase variables, so no workflow change
is needed here.

### 2. Deploy the publish worker

Follow the publish section of `serverless/README.md`. In short: create the
Cloudflare Worker from `serverless/publish-worker.js`, give it a GitHub token
with **Contents: Read and write** and **Pull requests: Read and write** on this
repository (a stronger token than the flag and submission workers use), and set
the `PUBLISH_ENDPOINT` repository variable to the Worker URL.

The deploy workflow reads `PUBLISH_ENDPOINT` into `NEXT_PUBLIC_PUBLISH_ENDPOINT`
at build time. That line is in `.github/workflows/deploy.yml`; the flag and
submission endpoints are wired the same way.

The flag worker (`FLAG_ENDPOINT`) and submission worker (`SUBMISSION_ENDPOINT`)
are optional for a bare publish. Without them you lose the "flag opened an issue"
and "curator notified" niceties, and the screens say so. Set them up the same
way when you want them.

### 3. Redeploy

Push to `main` (or run the deploy workflow by hand). The build inlines whatever
variables are set. Anything still empty keeps its honest "not connected" state.

## Publishing a meeting (repeatable)

1. **Create the meeting row.** There is no screen for this yet. An admin adds a
   row to the `meetings` table in Supabase with a title, body, date, and time.
   The coverage ledger then shows it.
2. **Submit the source.** In the workspace, open **Submit** and send the agenda,
   the minutes, and a recording link for that meeting. Agenda and minutes can
   arrive separately; neither wipes the other.
3. **Draft each item.** Open **Draft** from the ledger and write a plain recap
   for each agenda item.
4. **Review each item.** Open **Review** and approve each draft. If the same
   person drafts and reviews, it is labeled a self review, and the published
   item says so. A different reviewer makes it an independent review.
5. **Publish.** Open **Publish**, read what is about to go out one more time, and
   publish. The worker commits the built meeting to `clawson.json` on a new
   branch and opens a pull request. Nothing is public yet.
6. **Merge the pull request.** A person reviews and merges it. That merge is what
   makes the meeting visible, and it triggers the deploy that ships it.

## Known gaps, on purpose

These are places the pipeline asks a person to do something by hand. They are
labeled honestly in the product; none of them blocks a real publish.

- **No create-meeting screen.** Meetings are added directly in Supabase (step 1
  above).
- **No software drafting.** Every draft is written by a person. The provenance
  line for software-written drafts exists in the schema for later; the workspace
  does not write one today.
- **The verification log starts empty.** It fills as flags are checked and
  logged through the workspace.
