import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RootClientLayout from "@/components/layout/RootClientLayout";
import { SessionProvider } from "next-auth/react";
import I18nProvider from "@/components/I18nProvider";
// 1. Importamos el nuevo Registry
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import ParallaxClientProvider from "@/components/providers/ParallaxProvider";
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
        <ParallaxClientProvider>
          <ReactQueryProvider>
            <ThemeRegistry>
              <I18nProvider>
                <SessionProvider>
                  <AuthProvider>
                    <RootClientLayout>{children}</RootClientLayout>
                  </AuthProvider>
                </SessionProvider>
              </I18nProvider>
            </ThemeRegistry>
          </ReactQueryProvider>
        </ParallaxClientProvider>
      </body>
    </html>
  );
}
