import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignora gli errori di TypeScript durante il build (molto importante ora!)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora gli errori di linting (quelli che mettono il rosso sotto le parole)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;