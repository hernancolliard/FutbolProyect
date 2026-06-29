import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

const title =
  "FutbolProyect | Mostrá tu fútbol y conectá con oportunidades";
const description =
  "Creá tu perfil deportivo en FutbolProyect, cargá videos, fotos, trayectoria y datos profesionales. Conectá con clubes, agencias, scouts y nuevas oportunidades en el fútbol.";

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "FutbolProyect",
    title,
    description,
    images: [
      {
        url: "/images/jugador-estadio-futbol.webp",
        width: 1672,
        height: 941,
        alt: "Futbolista en un estadio con el logo de FutbolProyect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/jugador-estadio-futbol.webp"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
