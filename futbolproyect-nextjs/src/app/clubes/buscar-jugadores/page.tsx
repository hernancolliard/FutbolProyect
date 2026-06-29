import type { Metadata } from "next";
import ProfileSeoLanding from "@/components/seo/ProfileSeoLanding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Buscar jugadores para clubes | FutbolProyect" },
  description:
    "Encontrá jugadores para tu club mediante perfiles deportivos con posición, trayectoria, videos, estadísticas y datos profesionales.",
  alternates: { canonical: "/clubes/buscar-jugadores" },
};

export default function BuscarJugadoresClubesPage() {
  return (
    <ProfileSeoLanding
      h1="Buscar jugadores para clubes de fútbol"
      mainText="Consultá perfiles deportivos para identificar futbolistas adecuados para tu plantel, academia o proyecto. Filtrá por posición y nacionalidad, revisá su trayectoria y accedé a material profesional.\n\nLos clubes también pueden publicar ofertas para recibir postulaciones de jugadores y profesionales."
      h2="Talento disponible para clubes"
      ctaText="Publicar una oferta para mi club"
      ctaLink="/create-offer"
    />
  );
}
