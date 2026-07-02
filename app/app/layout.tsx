import BottomBar from "./BottomBar";

/**
 * Resident-app shell (Phase 1). A five-tab bottom bar over a scrollable content
 * area. The tabs' surfaces are placeholders until later phases.
 */
export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--shell)" }}>
      {/* Content sits above the fixed bottom bar; reserve room for it. */}
      <div style={{ paddingBottom: "72px" }}>{children}</div>
      <BottomBar />
    </div>
  );
}
