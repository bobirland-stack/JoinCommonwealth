/* ============================================================================
   submission-worker.js — the scout submission notice (Stage A, Task 2, Part 2).
   ----------------------------------------------------------------------------
   A tiny Cloudflare Worker, the twin of flag-worker.js. It is the same pattern
   Phase 7 already put in place: a single server-side file that holds a GitHub
   token and opens a GitHub Issue, because a token can never live in code that
   ships to a browser on a static site.

   When a scout submits an agenda, minutes, or a recording link for a meeting,
   the workspace saves it to the database and then calls this function. This
   function opens a GitHub Issue titled "New submission: {meeting title}" so the
   curator team gets a plain, durable notice that there is something new to
   work on. It reuses the same GITHUB_TOKEN secret pattern and the same GitHub
   Issues pipeline as the flag flow, rather than standing up a second mechanism.

   The GitHub token is read from an environment secret (GITHUB_TOKEN), set in
   the Cloudflare dashboard. It is never in this file and never committed.

   Deploy: see serverless/README.md. There is no build step; this single file
   is the whole Worker.
   ========================================================================== */

// The GitHub Pages origin the app is served from. Only this origin may call the
// function from a browser.
const ALLOW_ORIGIN = "https://bobirland-stack.github.io";

// The repository issues are opened on.
const REPO = "bobirland-stack/joincommonwealth";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

// Trim a title down to a short, one-line issue-title summary.
function shorten(text) {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > 72 ? oneLine.slice(0, 71) + "…" : oneLine;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return json({ error: "Use POST." }, 405);
    }

    const token = env.GITHUB_TOKEN;
    if (!token) {
      return json(
        { error: "The submission function is not configured yet." },
        500,
      );
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "Could not read the request." }, 400);
    }

    const meeting = (data.meeting ?? "").toString().trim();
    if (!meeting) {
      return json({ error: "No meeting was included." }, 400);
    }
    const submittedBy = (data.submittedBy ?? "").toString().trim();
    const hasAgenda = Boolean(data.hasAgenda);
    const hasMinutes = Boolean(data.hasMinutes);
    const recording = (data.recording ?? "").toString().trim();

    // A plain list of what came in with this submission.
    const parts = [];
    if (hasAgenda) parts.push("agenda text");
    if (hasMinutes) parts.push("minutes text");
    if (recording) parts.push("a recording link");
    const what = parts.length ? parts.join(", ") : "an update";

    const title = `New submission: ${shorten(meeting)}`;
    const body = [
      "A scout sent in new material for a meeting.",
      "",
      "**Meeting**",
      meeting,
      "",
      "**What came in**",
      what,
      "",
      "**Recording link**",
      recording || "(none)",
      "",
      "**Sent by**",
      submittedBy || "(name not recorded)",
      "",
      "Open the coverage ledger in the workspace to pick it up.",
    ].join("\n");

    let res;
    try {
      res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "commonwealth-submission",
        },
        body: JSON.stringify({ title, body, labels: ["submission"] }),
      });
    } catch {
      return json({ error: "Could not reach GitHub." }, 502);
    }

    if (!res.ok) {
      return json({ error: "GitHub did not accept the submission." }, 502);
    }

    const issue = await res.json();
    return json({ ok: true, url: issue.html_url }, 200);
  },
};
