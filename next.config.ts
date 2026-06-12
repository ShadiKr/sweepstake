import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lint is run separately via `npm run lint`; don't fail production builds on it.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
