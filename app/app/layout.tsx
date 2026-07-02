import AppShell from "@/src/components/AppShell";
// The resident-app stylesheet (Phase 3). Imported here so it applies to every
// /app route and never leaks into the marketing pages (which load site.css).
import "@/src/styles/app.css";

/**
 * Resident-app shell. Every tab is a route rendered as {children} inside the
 * shared shell (top bar, footnote, How-this-works sheet, toast, bottom tab bar).
 * The shell also provides the toast / source-panel / how-sheet behaviors the
 * tab surfaces depend on. See src/components/AppShell.tsx.
 */
export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
