import type { NextConfig } from "next";

/**
 * Static generation (ADR-001). `output: "export"` pre-renders every route to
 * plain HTML in `out/` at build time — no server, no per-request SSR. The town
 * record is bundled at build (ADR-002), so there is nothing to fetch at
 * runtime. `images.unoptimized` is required because static export has no image
 * optimization server.
 *
 * GitHub Pages preview: the repo is served from a subpath
 * (https://bobirland-stack.github.io/JoinCommonwealth/), so `basePath` and
 * `assetPrefix` must be set to that subpath — but ONLY for the Pages build,
 * gated behind GITHUB_PAGES=true. Local `next dev` / `next build` leave them
 * unset and serve from the root, unaffected.
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoBasePath = "/JoinCommonwealth";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  ...(isGithubPages
    ? { basePath: repoBasePath, assetPrefix: repoBasePath }
    : {}),
};

export default nextConfig;
