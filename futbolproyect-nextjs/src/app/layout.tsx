import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import GoogleTagManager from "@/components/GoogleTagManager";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FutbolProyect",
  description: "Conectando el mundo del fútbol",
  icons: [
    {
      rel: 'icon',
      url: '/images/logos/logofpblanco.png',
      media: '(prefers-color-scheme: dark)',
    },
    {
      rel: 'icon',
      url: '/images/logos/logofpazul.png',
      media: '(prefers-color-scheme: light)',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Suspense fallback={<></>}>
          <GoogleTagManager />
        </Suspense>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
