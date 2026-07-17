import type { Metadata } from "next";
import OfferSeoLanding from "@/components/seo/OfferSeoLanding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Ofertas para futbolistas | FutbolProyect" },
  description:
    "Encontrá ofertas para futbolistas publicadas por clubes, agencias y proyectos deportivos. Creá tu perfil y postulá a nuevas oportunidades.",
  alternates: { canonical: "/ofertas/futbolistas" },
};

export default function OfertasFutbolistasPage() {
  return (
    <OfferSeoLanding
      role="jugador"
      translationPrefix="player_offers_landing"
    />
  );
}
