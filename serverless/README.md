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
