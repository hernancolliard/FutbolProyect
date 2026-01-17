import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RootClientLayout from "@/components/layout/RootClientLayout";
import I18nProvider from "@/components/I18nProvider";
// 1. Importamos el nuevo Registry
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

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
  return (
    <html lang="es">
      <body className={inter.className}>
        <ReactQueryProvider>
          {/* 2. Envolvemos TODO con ThemeRegistry */}
          <ThemeRegistry>
            <I18nProvider>
              <AuthProvider>
                <RootClientLayout>{children}</RootClientLayout>
              </AuthProvider>
            </I18nProvider>
          </ThemeRegistry>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
