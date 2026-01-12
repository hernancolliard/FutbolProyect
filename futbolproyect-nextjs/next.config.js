import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    turbopack: false,
  },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "./src");
    return config;
  },
};

export default nextConfig;
