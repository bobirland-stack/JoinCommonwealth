/* ============================================================================
   follows.ts — the shared, localStorage-backed preferences store.
   ----------------------------------------------------------------------------
   The ONE module that owns the resident's local state: the topics they follow,
   their digest email, and their reading/display preferences. It is deliberately
   framework-agnostic (no React) so any surface can read/write it.

     - The Settings page (Phase 2g) uses it now.
     - The resident app (Phase 3–4) reuses the SAME module and the SAME
       localStorage key, so a follow set in Settings shows up in the app and
       vice-versa. Nothing about this store is Settings-specific.

   Design notes:
     - Everything is guarded for SSR: reads return sensible defaults when there
       is no `window`, so this can be imported from components that render on
       the server and hydrate on the client.
     - A tiny subscribe() pub/sub lets multiple mounted components stay in sync
       without prop-threading. A `storage` event bridge keeps two open tabs in
       sync as well.
     - The persisted shape is versioned by the key (`:v1`). Unknown/partial
       stored blobs are merged over defaults so a forward-compatible field
       written by a later phase never crashes an older reader, and vice-versa.
   ========================================================================== */

/** The localStorage key. Shared verbatim by every phase — do not fork it. */
export const STORAGE_KEY = "cw:settings:v1";

/** Reading & display preferences. Booleans map to body classes / device hints. */
export interface Prefs {
  /** Larger base text — toggles `body.bigtext`. */
  bigtext: boolean;
  /** Higher contrast — toggles `body.contrast`. */
  contrast: boolean;
  /** Reduce motion — respected alongside the device `prefers-reduced-motion`. */
  reducemotion: boolean;
}

/** The full persisted state. */
export interface Settings {
  /** Followed topic ids (matching `town.topics[].id`). */
  follows: string[];
  /** The digest / newsletter email, or "" if unset. */
  email: string;
  /** Reading & display preferences. */
  prefs: Prefs;
}

/** A fresh, empty settings object. Also the reset target for "Delete everything". */
export function defaultSettings(): Settings {
  return {
    follows: [],
    email: "",
    prefs: { bigtext: false, contrast: false, reducemotion: false },
  };
}

/* --- internal cache + subscribers ---------------------------------------- */

type Listener = (s: Settings) => void;

let cache: Settings | null = null;
const listeners = new Set<Listener>();
let bridged = false;

/** Merge an unknown parsed blob over defaults, coercing types defensively. */
function normalize(raw: unknown): Settings {
  const base = defaultSettings();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Settings> & { prefs?: Partial<Prefs> };
  return {
    follows: Array.isArray(r.follows)
      ? r.follows.filter((f): f is string => typeof f === "string")
      : base.follows,
    email: typeof r.email === "string" ? r.email : base.email,
    prefs: {
      bigtext: !!r.prefs?.bigtext,
      contrast: !!r.prefs?.contrast,
      reducemotion: !!r.prefs?.reducemotion,
    },
  };
}

/** Read straight from localStorage (used to (re)prime the cache). */
function readStorage(): Settings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : defaultSettings();
  } catch {
    return defaultSettings();
  }
}

/** Attach the cross-tab bridge once, lazily (on first subscribe). */
function ensureBridge(): void {
  if (bridged || typeof window === "undefined") return;
  bridged = true;
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    cache = readStorage();
    for (const l of listeners) l(cache);
  });
}

/* --- public API ---------------------------------------------------------- */

/**
 * The current settings. SSR-safe: returns defaults on the server. On the client
 * the first call primes an in-memory cache from localStorage; subsequent calls
 * are cheap and reflect the latest in-session writes.
 */
export function getSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings();
  if (cache === null) cache = readStorage();
  return cache;
}

/** Persist `next`, update the cache, and notify subscribers. */
export function saveSettings(next: Settings): Settings {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage full / disabled — keep the in-memory cache authoritative */
    }
  }
  for (const l of listeners) l(next);
  return next;
}

/** Read-modify-write helper: apply `fn` to the current settings and persist. */
export function updateSettings(fn: (s: Settings) => Settings): Settings {
  return saveSettings(fn(getSettings()));
}

/**
 * Subscribe to settings changes. Fires on every save (this tab) and on storage
 * events (other tabs). Returns an unsubscribe function. Does NOT fire on
 * subscribe — read getSettings() for the initial value.
 */
export function subscribe(fn: Listener): () => void {
  ensureBridge();
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/* --- convenience mutators (all persist + notify) -------------------------- */

/** Is topic `id` currently followed? */
export function isFollowing(id: string): boolean {
  return getSettings().follows.includes(id);
}

/** Toggle a followed topic; returns the new settings. */
export function toggleFollow(id: string): Settings {
  return updateSettings((s) => {
    const on = s.follows.includes(id);
    return {
      ...s,
      follows: on ? s.follows.filter((f) => f !== id) : [...s.follows, id],
    };
  });
}

/** Set (or clear, with "") the digest email. */
export function setEmail(email: string): Settings {
  return updateSettings((s) => ({ ...s, email }));
}

/** Set a single reading/display preference. */
export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]): Settings {
  return updateSettings((s) => ({ ...s, prefs: { ...s.prefs, [key]: value } }));
}

/** Reset everything to defaults and remove the stored blob. */
export function clearAll(): Settings {
  const fresh = defaultSettings();
  cache = fresh;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  for (const l of listeners) l(fresh);
  return fresh;
}

/** The stored state as pretty JSON (for "Export my data"). */
export function exportJSON(): string {
  return JSON.stringify(getSettings(), null, 2);
}
