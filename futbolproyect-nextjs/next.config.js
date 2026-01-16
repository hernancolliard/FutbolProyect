const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Opción 1: El formato estándar de S3
        hostname: "futbolproyect-imagenes.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        // Opción 2: El formato con la región explícita (por si acaso)
        hostname: "futbolproyect-imagenes.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      // Si usas Google o redes sociales para fotos de perfil, mantenlas o usa '**'
      // {
      //   protocol: 'https',
      //   hostname: 'lh3.googleusercontent.com',
      // },
    ],
  },
};

module.exports = nextConfig;
