const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 CLAVE: export estático
  output: "export",

  // Next necesita URLs con / al final en export
  trailingSlash: true,

  // Variables públicas
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://futbolproyect.com/api",
  },

  // i18n ⚠️ OJO: Next export NO soporta i18n nativo
  // Vamos a manejar idiomas con rutas (/es, /en) o i18next
  i18n: undefined,

  // Headers (solo se aplican si el hosting los respeta)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },

  // Imágenes remotas (S3 OK)
  images: {
    unoptimized: true, // NECESARIO para export
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
