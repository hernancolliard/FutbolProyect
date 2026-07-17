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
      translationPrefix="scout_offers_landing"
    />
  );
}
