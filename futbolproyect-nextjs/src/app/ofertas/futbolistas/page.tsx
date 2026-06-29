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
      h1="Ofertas para futbolistas"
      mainText="Encontrá oportunidades para jugadores de fútbol publicadas por clubes, agencias y organizaciones deportivas. Consultá cada propuesta, sus requisitos, ubicación y nivel competitivo.\n\nCreá un perfil deportivo con tu trayectoria, posición, fotos y videos para presentar tu experiencia profesional."
      h2="Oportunidades para jugadores de fútbol"
    />
  );
}
