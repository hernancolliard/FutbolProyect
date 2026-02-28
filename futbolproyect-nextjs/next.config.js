/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 120,
  trailingSlash: false,



  images: {
    // La optimización de imágenes está activada (unoptimized: false),
    // lo cual es correcto para que Vercel pueda optimizar las imágenes automáticamente.
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
