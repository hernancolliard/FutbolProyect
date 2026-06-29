import type { Metadata } from "next";
import OfferSeoLanding from "@/components/seo/OfferSeoLanding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Ofertas para entrenadores de fútbol | FutbolProyect" },
  description:
    "Buscá trabajo como entrenador de fútbol y conectá con clubes, academias y proyectos que necesitan cuerpos técnicos.",
  alternates: { canonical: "/ofertas/entrenadores" },
};

export default function OfertasEntrenadoresPage() {
  return (
    <OfferSeoLanding
      role="entrenador"
      h1="Ofertas para entrenadores de fútbol"
      mainText="Explorá oportunidades para entrenadores, directores técnicos y asistentes en clubes, academias y proyectos de fútbol. Encontrá propuestas acordes a tu experiencia y metodología de trabajo."
      h2="Trabajo para entrenadores y cuerpos técnicos"
    />
  );
}
