"use client";

/* ============================================================================
   NewsletterSignup — the weekly digest signup form (Phase 5).
   ----------------------------------------------------------------------------
   V1 keeps no email backend of its own. Signups go to a hosted newsletter
   service (a Buttondown-class tool) that owns the list, the delivery, and the
   unsubscribe link. This component is a single email field that posts to that
   service's signup endpoint.

   TO CONNECT THE REAL SERVICE: paste the form action URL below, and that's the
   only change. Buttondown gives it to you on the "Embedding" page; it looks
   like:  https://buttondown.com/api/emails/embed-subscribe/YOUR_USERNAME
   (If the dashboard hands you just your username, drop it on the end of that
   same path.) Leave it as an empty string until then.

   Until the URL is filled in, the form renders correctly and is honestly inert:
   submitting shows a short message that signup goes live once the newsletter
   account is connected. It never pretends to subscribe anyone.
   ========================================================================== */

// ▼▼▼ PASTE THE NEWSLETTER SERVICE FORM ACTION URL HERE (one line) ▼▼▼
export const NEWSLETTER_ACTION_URL = "";
// ▲▲▲ e.g. "https://buttondown.com/api/emails/embed-subscribe/clawson" ▲▲▲

import { useId, useState } from "react";
import styles from "./NewsletterSignup.module.css";

/** Which surface this instance sits on, so it can size itself to fit. */
type Variant = "panel" | "footer";

export default function NewsletterSignup({
  variant = "panel",
}: {
  variant?: Variant;
}) {
  const id = useId();
  const [message, setMessage] = useState("");
  const connected = NEWSLETTER_ACTION_URL.trim().length > 0;

  // When the service is connected, let the browser post the form to it natively
  // (that is exactly what the embed expects). Until then, stay inert and say so.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!connected) {
      e.preventDefault();
      setMessage(
        "Signup goes live once the newsletter account is connected. Nothing is sent yet.",
      );
    }
  };

  const rootClass =
    variant === "footer" ? `${styles.root} ${styles.footer}` : styles.root;

  return (
    <form
      className={rootClass}
      // Empty until connected; the browser ignores an empty action, and our
      // onSubmit keeps it inert either way.
      action={connected ? NEWSLETTER_ACTION_URL : undefined}
      method="post"
      target="_blank"
      onSubmit={onSubmit}
    >
      <label className={styles.label} htmlFor={`nl-${id}`}>
        {variant === "footer"
          ? "Get the weekly digest"
          : "Get the weekly digest by email"}
      </label>
      <div className={styles.row}>
        <input
          className={styles.input}
          id={`nl-${id}`}
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <button className={styles.button} type="submit">
          Subscribe
        </button>
      </div>
      {message ? (
        <p className={styles.note} role="status" aria-live="polite">
          {message}
        </p>
      ) : (
        <p className={styles.hint}>One email a week. Unsubscribe anytime.</p>
      )}
    </form>
  );
}
