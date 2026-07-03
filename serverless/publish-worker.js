/* ============================================================================
   publish-worker.js — the publish function (Stage A, Task 3).
   ----------------------------------------------------------------------------
   A tiny Cloudflare Worker, the third in the family that already holds the flag
   and submission functions. It is the one piece of the publish flow that runs
   server-side, because committing a file and opening a pull request needs a
   GitHub token, and a token can never live in code that ships to a browser on a
   static site.

   It does one honest thing: takes an already-built, schema-shaped payload from
   the workspace and writes it into the repository as its own small pull
   request, so a person reviews and merges it. It never invents content. All the
   shaping happens in the app (src/curation/publish.ts) where it is typed
   against data/towns/schema.ts; this worker only does the git mechanics.

   Two kinds of publish, each landing as its own branch and pull request so the
   audit trail stays "one commit, one meeting" (ADR-002):

     kind: "meeting"       merge a Meeting into data/towns/clawson.json
     kind: "verification"  append entries to data/verification-log.json

   The GitHub token is read from an environment secret (GITHUB_TOKEN), set in
   the Cloudflare dashboard. It needs Contents (read and write) and Pull
   requests (read and write) on this repository. That is more than the flag and
   submission functions need, so this worker uses its own token. It is never in
   this file and never committed.

   Deploy: see serverless/README.md. There is no build step; this single file is
   the whole Worker.
   ========================================================================== */

// The GitHub Pages origin the workspace is served from. Only this origin may
// call the function from a browser.
const ALLOW_ORIGIN = "https://bobirland-stack.github.io";

// The repository the pull request is opened on, and the branch it targets.
const REPO = "bobirland-stack/joincommonwealth";
const BASE_BRANCH = "main";

const CLAWSON_PATH = "data/towns/clawson.json";
const VERIFICATION_PATH = "data/verification-log.json";

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

/* --- base64 <-> UTF-8, so em dashes and the like survive the round trip ---- */

function b64ToText(b64) {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function textToB64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/* --- the GitHub calls, kept small and named ------------------------------- */

function gh(env, path, init) {
  return fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "commonwealth-publish",
      ...(init && init.headers),
    },
  });
}

// The current file: its text and its blob sha (needed to update it).
async function getFile(env, path) {
  const res = await gh(
    env,
    `/contents/${path}?ref=${BASE_BRANCH}`,
    { method: "GET" },
  );
  if (!res.ok) throw new Error(`Could not read ${path} from GitHub.`);
  const data = await res.json();
  return { text: b64ToText(data.content), sha: data.sha };
}

// The tip commit of the base branch, to start the new branch from.
async function getBaseSha(env) {
  const res = await gh(env, `/git/ref/heads/${BASE_BRANCH}`, { method: "GET" });
  if (!res.ok) throw new Error("Could not read the base branch.");
  const data = await res.json();
  return data.object.sha;
}

async function createBranch(env, branch, sha) {
  const res = await gh(env, `/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
  });
  if (!res.ok) throw new Error("Could not create the publish branch.");
}

async function putFile(env, path, text, sha, branch, message) {
  const res = await gh(env, `/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: textToB64(text),
      sha,
      branch,
    }),
  });
  if (!res.ok) throw new Error(`Could not commit ${path}.`);
}

async function openPr(env, branch, title, body) {
  const res = await gh(env, `/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, head: branch, base: BASE_BRANCH, body }),
  });
  if (!res.ok) throw new Error("Could not open the pull request.");
  return res.json();
}

// Serialize a town/log object the same way the checked-in files are written:
// two-space indent and a trailing newline, so the diff stays small.
function serialize(obj) {
  return JSON.stringify(obj, null, 2) + "\n";
}

function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "publish"
  );
}

/* --- the two publish kinds ------------------------------------------------ */

async function publishMeeting(env, payload) {
  const meeting = payload.meeting;
  if (!meeting || !meeting.id) {
    return json({ error: "No meeting was included." }, 400);
  }
  const commitTitle =
    (payload.commitTitle || "").toString().trim() ||
    `Publish: ${meeting.title}, ${meeting.date || "no date"}`;

  const file = await getFile(env, CLAWSON_PATH);
  const town = JSON.parse(file.text);
  if (!Array.isArray(town.meetings)) {
    throw new Error("clawson.json has no meetings array to publish into.");
  }

  // Replace an existing meeting with the same id, or add it. Everything else in
  // the file is left exactly as it was.
  const at = town.meetings.findIndex((m) => m.id === meeting.id);
  if (at >= 0) town.meetings[at] = meeting;
  else town.meetings.push(meeting);

  const branch = `publish/${slugify(meeting.id)}-${Date.now().toString(36)}`;
  const baseSha = await getBaseSha(env);
  await createBranch(env, branch, baseSha);
  await putFile(env, CLAWSON_PATH, serialize(town), file.sha, branch, commitTitle);

  const itemLines = (meeting.items || [])
    .map((it) => {
      const how = it.source && it.source.selfReviewed ? "self review" : "independent review";
      return `- ${it.title} (${how})`;
    })
    .join("\n");
  const body = [
    "Publishes one reviewed meeting into `data/towns/clawson.json`.",
    "",
    `**Meeting:** ${meeting.title}`,
    `**Date:** ${meeting.date || "no date set"}`,
    "",
    "**Items**",
    itemLines || "(none)",
    "",
    "One commit, one meeting, reviewable on its own (ADR-002). Merging this " +
      "makes it visible to residents; nothing was visible before this.",
  ].join("\n");

  const pr = await openPr(env, branch, commitTitle, body);
  return json({ ok: true, url: pr.html_url }, 200);
}

async function publishVerification(env, payload) {
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  if (entries.length === 0) {
    return json({ error: "No verification entries were included." }, 400);
  }

  const file = await getFile(env, VERIFICATION_PATH);
  const log = JSON.parse(file.text);
  if (!Array.isArray(log)) {
    throw new Error("verification-log.json is not a list.");
  }
  log.push(...entries);

  const first = entries[0];
  const commitTitle =
    (payload.commitTitle || "").toString().trim() ||
    `Verification log: ${first.claim ? first.claim.slice(0, 60) : "entry"}`;

  const branch = `verification/${slugify(first.claim || "entry")}-${Date.now().toString(36)}`;
  const baseSha = await getBaseSha(env);
  await createBranch(env, branch, baseSha);
  await putFile(
    env,
    VERIFICATION_PATH,
    serialize(log),
    file.sha,
    branch,
    commitTitle,
  );

  const body = [
    "Adds a checked flag to `data/verification-log.json`.",
    "",
    ...entries.map(
      (e) =>
        `- **${e.claim}** — ${e.outcome} (${e.dateChecked}); source: ${
          e.source ? e.source.label : ""
        }`,
    ),
    "",
    "The document decided the outcome. Both outcomes are logged publicly.",
  ].join("\n");

  const pr = await openPr(env, branch, commitTitle, body);
  return json({ ok: true, url: pr.html_url }, 200);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return json({ error: "Use POST." }, 405);
    }
    if (!env.GITHUB_TOKEN) {
      return json({ error: "The publish function is not configured yet." }, 500);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Could not read the request." }, 400);
    }

    try {
      if (payload.kind === "verification") {
        return await publishVerification(env, payload);
      }
      // Default and "meeting" both publish a meeting.
      return await publishMeeting(env, payload);
    } catch (err) {
      // Nothing is marked published on the app side unless this returns ok, so
      // a failure here leaves the ledger honest. Say what went wrong.
      return json(
        { error: err && err.message ? err.message : "The publish failed." },
        502,
      );
    }
  },
};
