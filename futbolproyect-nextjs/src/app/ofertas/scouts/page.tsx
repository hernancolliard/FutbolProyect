import type { Metadata } from "next";
import OfferSeoLanding from "@/components/seo/OfferSeoLanding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Ofertas de scouting de fútbol | FutbolProyect" },
  description:
    "Encontrá oportunidades para scouts, ojeadores y captadores de talento en clubes, agencias y proyectos de fútbol.",
  alternates: { canonical: "/ofertas/scouts" },
};

export default function OfertasScoutsPage() {
  return (
    <OfferSeoLanding
      role="scout"
      h1="Ofertas para scouts y ojeadores de fútbol"
      mainText="Explorá oportunidades de scouting, captación y evaluación de jugadores. Presentá tu experiencia, zonas de trabajo y metodología a clubes y agencias."
      h2="Oportunidades profesionales en scouting"
    />
  );
}
