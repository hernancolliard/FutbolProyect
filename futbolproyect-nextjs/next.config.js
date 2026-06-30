/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  staticPageGenerationTimeout: 120,
  trailingSlash: false,
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "react-icons",
    ],
  },

  // Agregar headers para permitir Google OAuth popups
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  images: {
    // Las imágenes subidas ya se convierten y redimensionan a WebP en el backend.
    // Servirlas directamente evita depender de la cuota de transformaciones de Vercel.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "futbolproyect-imagenes.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "futbolproyect-imagenes.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
