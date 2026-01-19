import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RootClientLayout from "@/components/layout/RootClientLayout";
import I18nProvider from "@/components/I18nProvider";
// 1. Importamos el nuevo Registry
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import ParallaxClientProvider from "@/components/providers/ParallaxProvider";
import { GoogleOAuthProvider } from '@react-oauth/google'; // Importar GoogleOAuthProvider
import GoogleTagManager from "@/components/GoogleTagManager";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FutbolProyect",
  description: "Conectando el mundo del fútbol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''; // Obtener Client ID

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
                {/* Envolver AuthProvider con GoogleOAuthProvider */}
                <GoogleOAuthProvider clientId={googleClientId}>
                  <AuthProvider>
                    <RootClientLayout>{children}</RootClientLayout>
                  </AuthProvider>
                </GoogleOAuthProvider>
              </I18nProvider>
            </ThemeRegistry>
          </ReactQueryProvider>
        </ParallaxClientProvider>
      </body>
    </html>
  );
}
