import type { Metadata } from "next";
import { town } from "@/src/town";
// Global design tokens (ADR-001: plain CSS custom properties, no Tailwind).
import "@/src/styles/tokens.css";

export const metadata: Metadata = {
  title: "Commonwealth",
  description:
    `A neutral mirror of the public record for ${town.town.name}, ${town.town.stateAbbr}. ` +
    "Not affiliated with the city — it links to and defers to its official sources.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts named by tokens.css: Public Sans, Spline Sans Mono, Newsreader. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
