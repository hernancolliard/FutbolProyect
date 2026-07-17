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
      translationPrefix="clubs_find_players_landing"
      ctaLink="/create-offer"
    />
  );
}
