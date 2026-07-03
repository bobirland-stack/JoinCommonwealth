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
