import type { Metadata } from "next";
import ProfileSeoLanding from "@/components/seo/ProfileSeoLanding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Perfiles de jugadores de fútbol | FutbolProyect" },
  description:
    "Explorá perfiles de jugadores con posición, nacionalidad, trayectoria, videos y datos deportivos para clubes, agencias y scouts.",
  alternates: { canonical: "/perfiles/jugadores" },
};

export default function PerfilesJugadoresPage() {
  return (
    <ProfileSeoLanding
      translationPrefix="player_profiles_landing"
      ctaLink="/register"
    />
  );
}
