import type { NextConfig } from "next";

/**
 * Static generation (ADR-001). `output: "export"` pre-renders every route to
 * plain HTML in `out/` at build time — no server, no per-request SSR. The town
 * record is bundled at build (ADR-002), so there is nothing to fetch at
 * runtime. `images.unoptimized` is required because static export has no image
 * optimization server.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
