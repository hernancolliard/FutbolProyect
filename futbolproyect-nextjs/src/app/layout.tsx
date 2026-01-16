import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RootClientLayout from "@/components/layout/RootClientLayout"; // <--- Importamos el layout cliente
import { I18nProvider } from "@/components/I18nProvider"; // Aseguramos las traducciones

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
        <I18nProvider>
          <AuthProvider>
            {/* Usamos el wrapper cliente que maneja el Header y los Modales */}
            <RootClientLayout>{children}</RootClientLayout>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
