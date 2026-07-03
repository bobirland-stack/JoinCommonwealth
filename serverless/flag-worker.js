/* ============================================================================
   flag-worker.js — the flag intake function (Phase 7, Part 2).
   ----------------------------------------------------------------------------
   A tiny Cloudflare Worker. It is the one piece of Commonwealth that runs
   server-side, because creating a GitHub Issue needs a token, and a token can
   never live in client-side code on a static site.

   It receives a flagged point from the app, and opens a GitHub Issue on this
   same repo describing what was flagged, the source it was checked against, and
   the page it came from. The GitHub token is read from an environment secret
   (GITHUB_TOKEN), set in the Cloudflare dashboard. It is never in this file and
   never committed.

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

// Trim a claim down to a short, one-line issue-title summary.
function summarize(claim) {
  const oneLine = claim.replace(/\s+/g, " ").trim();
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
      return json({ error: "The flag function is not configured yet." }, 500);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "Could not read the request." }, 400);
    }

    const claim = (data.claim ?? "").toString().trim();
    if (!claim) {
      return json({ error: "Nothing to check was included." }, 400);
    }
    const detail = (data.detail ?? "").toString().trim();
    const source = (data.source ?? "").toString().trim();
    const page = (data.page ?? "").toString().trim();

    const title = `Flag: ${summarize(claim)}`;
    const body = [
      "A resident flagged a point that may not match the source.",
      "",
      "**What was flagged**",
      claim,
      "",
      "**What they said looks wrong**",
      detail || "(no note left)",
      "",
      "**Checked against**",
      source || "(source not recorded)",
      "",
      "**Where it came from**",
      page || "(page not recorded)",
      "",
      "A person will compare this against the source document and log the outcome.",
    ].join("\n");

    let res;
    try {
      res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "commonwealth-flag",
        },
        body: JSON.stringify({ title, body, labels: ["flag"] }),
      });
    } catch {
      return json({ error: "Could not reach GitHub." }, 502);
    }

    if (!res.ok) {
      return json({ error: "GitHub did not accept the flag." }, 502);
    }

    const issue = await res.json();
    return json({ ok: true, url: issue.html_url }, 200);
  },
};
