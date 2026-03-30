import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootClientLayout from "@/components/layout/RootClientLayout";
import I18nProvider from "@/components/I18nProvider";
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import ParallaxClientProvider from "@/components/providers/ParallaxProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleTagManager from "@/components/GoogleTagManager";
import { AuthProvider } from "@/context/AuthContext";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FutbolProyect",
  description: "Conectando el mundo del fútbol",
  icons: {
    icon: [
      {
        url: "/images/logos/logofpazul.webp",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/images/logos/logofpblanco.webp",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="es">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <GoogleTagManager />
        </Suspense>

        <ParallaxClientProvider>
          <ReactQueryProvider>
            <ThemeRegistry>
              <I18nProvider>
                <GoogleOAuthProvider clientId={googleClientId}>
                  {/* auth provider added so useAuth never returns null */}
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
