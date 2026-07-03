/* ============================================================================
   Workspace layout — the internal curation area (Stage A, Task 2).
   ----------------------------------------------------------------------------
   Wraps every /workspace page in the sign-in gate and the small workspace
   chrome (WorkspaceShell). This area is internal only. It is not in SiteNav,
   the resident app, or any public page. It brings in the shared design tokens
   so it looks like the rest of Commonwealth, but it reuses none of the
   resident-facing nav or footer, on purpose.
   ========================================================================== */

import type { Metadata } from "next";
import "@/src/styles/tokens.css";
import WorkspaceShell from "./WorkspaceShell";

export const metadata: Metadata = {
  title: "Curation workspace",
  description: "Internal tool for the Commonwealth curation team.",
  robots: { index: false, follow: false },
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
