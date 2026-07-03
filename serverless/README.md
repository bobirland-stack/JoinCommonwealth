# The flag function

Commonwealth is a static site. It has no server of its own. Opening a GitHub
Issue needs a GitHub token, and a token can never sit in code that ships to a
browser. So the "Send for checking" button sends the flag to one small function
that runs on Cloudflare, holds the token safely, and opens the Issue.

`flag-worker.js` is the whole function. There is no build step.

## Why Cloudflare Workers

GitHub Pages cannot run server code, so the function has to live somewhere else.
A Cloudflare Worker is the smallest correct option: it is a single file, the
free plan is enough, and you paste the token into the dashboard instead of
committing it anywhere. It needs one new account and nothing installed on your
computer.

## Set it up (no terminal needed)

1. **Make a GitHub token.** On GitHub, go to Settings, then Developer settings,
   then Personal access tokens, then Fine-grained tokens. Create a token with
   access limited to the `bobirland-stack/joincommonwealth` repository and one
   permission: Issues, set to Read and write. Copy the token; you only see it
   once.
2. **Make a Cloudflare account** at cloudflare.com (free), then open Workers and
   Pages and create a Worker. Name it something like `commonwealth-flag`.
3. **Paste the code.** In the Worker editor, replace the sample code with the
   contents of `flag-worker.js` from this folder, then deploy.
4. **Add the token as a secret.** In the Worker's Settings, under Variables and
   Secrets, add a secret named `GITHUB_TOKEN` and paste the GitHub token as its
   value. Save. It is stored encrypted and is never shown in the code.
5. **Copy the Worker's URL** (it looks like
   `https://commonwealth-flag.your-name.workers.dev`).
6. **Tell the site where the function lives.** In the GitHub repo, go to
   Settings, then Secrets and variables, then Actions, then the Variables tab.
   Add a repository variable named `FLAG_ENDPOINT` set to the Worker URL. The
   next deploy picks it up, and the flag button starts opening real Issues.

Until step 6 is done, the flag flow is honest about it: it tells the resident it
could not send, rather than pretending it worked.

# The submission function

`submission-worker.js` is the twin of the flag function, added in Stage A,
Task 2. When a scout submits an agenda, minutes, or a recording link in the
curation workspace, the workspace saves it to the database and then calls this
function, which opens a GitHub Issue titled `New submission: {meeting title}` so
the curator team gets a plain, durable notice. It is the same pattern as the
flag function: one small Cloudflare Worker, one `GITHUB_TOKEN` secret, the same
GitHub Issues pipeline. We reuse it rather than standing up a second mechanism.

## Set it up

The steps are the same as the flag function above. You can reuse the same
GitHub token (it already has Issues: Read and write on this repository), or make
a second one the same way.

1. In Cloudflare, create a second Worker (for example `commonwealth-submission`).
2. Paste in the contents of `submission-worker.js` and deploy.
3. Add the `GITHUB_TOKEN` secret to this Worker the same way as before.
4. Copy the Worker's URL.
5. In the GitHub repo, under Settings, then Secrets and variables, then Actions,
   then the Variables tab, add a repository variable named `SUBMISSION_ENDPOINT`
   set to the Worker URL. The next deploy picks it up.

Until that variable is set, a submission still saves to the database. The notify
step just tells the scout that no notice was sent, rather than pretending one
was.

# The publish function

`publish-worker.js` is the third function in this family, added in Stage A,
Task 3. When a curator publishes a reviewed meeting in the workspace, the app
builds the exact objects `data/towns/clawson.json` expects and sends them to
this function. The function commits the change to a new branch and opens a small
pull request titled `Publish: {meeting title}, {date}`, so a person reviews and
merges it. Nothing is visible to a resident until that pull request is merged.

It also handles the light verification-log connection (Task 3, Part 3): the same
worker can append a checked flag to `data/verification-log.json` as its own
separate pull request. Each publish is one branch and one pull request, so the
audit trail stays "one commit, one meeting" (ADR-002).

## One difference from the other two functions: the token

The flag and submission functions only open Issues, so their token needs
`Issues: Read and write`. This function commits a file and opens a pull request,
so its token needs two different permissions on this repository:

- **Contents: Read and write** (to commit the file on a new branch)
- **Pull requests: Read and write** (to open the pull request)

Make a separate fine-grained token with those two permissions. Do not reuse the
Issues-only token; it cannot commit.

## Set it up

1. In Cloudflare, create a Worker (for example `commonwealth-publish`).
2. Paste in the contents of `publish-worker.js` and deploy.
3. Add a `GITHUB_TOKEN` secret to this Worker, using the Contents + Pull
   requests token described above.
4. Copy the Worker's URL.
5. In the GitHub repo, under Settings, then Secrets and variables, then Actions,
   then the Variables tab, add a repository variable named `PUBLISH_ENDPOINT`
   set to the Worker URL. The next deploy picks it up.

Until that variable is set, the publish screen says plainly that it cannot
publish yet. Unlike a submission, a publish has no "saved anyway" fallback: the
whole point is the commit, so a meeting is never marked published without one.
