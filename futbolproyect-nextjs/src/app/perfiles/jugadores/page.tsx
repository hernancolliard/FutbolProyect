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
      h1="Perfiles de jugadores de fútbol"
      mainText="Descubrí futbolistas con información deportiva, trayectoria, posición, nacionalidad, fotos y videos. Los perfiles facilitan el contacto profesional con clubes, agencias y scouts.\n\nSi sos jugador, creá tu perfil y compartilo como presentación deportiva."
      h2="Jugadores disponibles en FutbolProyect"
      ctaText="Crear mi perfil deportivo"
      ctaLink="/register"
    />
  );
}
