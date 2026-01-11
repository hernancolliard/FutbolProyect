import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Configuración para Next.js 16 y Turbopack
  turbopack: {}, // Silencia el error de Turbopack cuando se usa config.webpack
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "./src");
    return config;
  },
};

export default nextConfig;
