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

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.futbolproyect.com"),
  title: {
    default: "FutbolProyect | Perfiles y oportunidades en el fútbol",
    template: "%s | FutbolProyect",
  },
  description:
    "Creá tu perfil deportivo, compartí tu trayectoria y conectá con clubes, agencias, scouts y oportunidades profesionales en el fútbol.",
  applicationName: "FutbolProyect",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "FutbolProyect",
    title: "FutbolProyect | Perfiles y oportunidades en el fútbol",
    description:
      "Perfiles deportivos, ofertas y conexiones profesionales para jugadores, entrenadores, scouts, analistas, clubes y agencias.",
    images: [
      {
        url: "/images/jugador-estadio-futbol.webp",
        width: 1672,
        height: 941,
        alt: "FutbolProyect, perfiles y oportunidades en el fútbol",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FutbolProyect | Perfiles y oportunidades en el fútbol",
    description:
      "Creá tu perfil deportivo y conectá con clubes, agencias, scouts y oportunidades en el fútbol.",
    images: ["/images/jugador-estadio-futbol.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
