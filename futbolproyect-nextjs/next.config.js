/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 120,
  trailingSlash: false,

  // Agregar headers para permitir Google OAuth popups
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
    // Las imágenes subidas ya se convierten y redimensionan a WebP en el backend.
    // Servirlas directamente evita depender de la cuota de transformaciones de Vercel.
    unoptimized: true,
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
