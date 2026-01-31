const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desactiva trailingSlash a menos que sea estrictamente necesario
  trailingSlash: false,

  // Elimina i18n: undefined, deja que Next.js use su configuración por defecto
  // o configúralo formalmente si no vas a usar export estático.

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

  images: {
    // CAMBIO IMPORTANTE: Quita unoptimized: true para usar sharp en Render
    unoptimized: false,
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
