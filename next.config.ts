import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      allowedOrigins: ["virtuadoc.automatech.tech", "localhost:3000"]
    }
  }
};

export default nextConfig;
