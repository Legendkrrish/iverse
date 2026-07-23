import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses for faster transfer
  compress: true,
  // Optimize production performance
  reactStrictMode: true,
  // Reduce powered-by header for faster response
  poweredByHeader: false,
};

export default nextConfig;
