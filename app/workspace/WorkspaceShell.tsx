"use client";

/* ============================================================================
   WorkspaceShell — the gate and chrome for the curation workspace.
   ----------------------------------------------------------------------------
   The workspace is an internal tool for a handful of known people. It is not in
   the resident nav and not linked from any public page. Access is the Supabase
   collaborator model from Task 1: every table is behind row-level security that
   only a signed-in Supabase account can read or write.

   So this shell signs the collaborator in with Supabase Auth. It is not a new
   public login. There is no sign-up here; an admin creates the team's accounts
   in the Supabase dashboard, the same place team_members is filled in by hand.
   Residents never see this screen. Once signed in, the shell shows the small
   workspace nav and the pages; signed out, it shows only the sign-in form.

   Until the two Supabase variables are set, the shell says the workspace is not
   connected yet, rather than showing a form that cannot work.
   ========================================================================== */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/src/supabase";
import styles from "./workspace.module.css";

type Status = "loading" | "signed_out" | "signed_in";

export default function WorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const session = data.session;
      setSignedInEmail(session?.user?.email ?? null);
      setStatus(session ? "signed_in" : "signed_out");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedInEmail(session?.user?.email ?? null);
      setStatus(session ? "signed_in" : "signed_out");
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setWorking(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setWorking(false);
    if (signInError) {
      setError(
        "That email and password did not sign you in. Check them and try again.",
      );
      return;
    }
    setPassword("");
  }

  async function onSignOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  // The workspace is not wired to its database yet. Be honest about it.
  if (!isSupabaseConfigured) {
    return (
      <main className={styles.gate}>
        <div className={styles.gateCard}>
          <h1 className={styles.gateTitle}>The workspace is not connected yet</h1>
          <p className={styles.gateText}>
            This internal tool needs its Supabase connection before it can open.
            Set the two Supabase variables in the deploy settings and redeploy.
            Nothing here works until then.
          </p>
        </div>
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className={styles.gate}>
        <div className={styles.gateCard}>
          <p className={styles.gateText}>Checking your sign-in.</p>
        </div>
      </main>
    );
  }

  if (status === "signed_out") {
    return (
      <main className={styles.gate}>
        <form className={styles.gateCard} onSubmit={onSignIn}>
          <h1 className={styles.gateTitle}>Curation workspace</h1>
          <p className={styles.gateText}>
            Sign in with your team account. Accounts are set up in Supabase by an
            admin. This tool is for the curation team.
          </p>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button className={styles.primary} type="submit" disabled={working}>
            {working ? "Signing in" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Commonwealth</span>
          <span className={styles.brandTag}>Curation workspace</span>
        </div>
        <WorkspaceNav />
        <div className={styles.account}>
          {signedInEmail ? (
            <span className={styles.who}>{signedInEmail}</span>
          ) : null}
          <button className={styles.ghost} type="button" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

function WorkspaceNav() {
  const pathname = usePathname();
  const links = [
    { href: "/workspace", label: "Coverage ledger" },
    { href: "/workspace/submit", label: "Submit" },
  ];
  return (
    <nav className={styles.nav} aria-label="Workspace">
      {links.map((link) => {
        const active =
          link.href === "/workspace"
            ? pathname === "/workspace"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? `${styles.navlink} ${styles.active}` : styles.navlink}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
