import type { Metadata } from "next";
import ProfileSeoLanding from "@/components/seo/ProfileSeoLanding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Scouting e informes de jugadores | FutbolProyect" },
  description:
    "Consultá perfiles e información deportiva para scouting, evaluación de jugadores y elaboración de informes de fútbol.",
  alternates: { canonical: "/scouting/informes" },
};

export default function ScoutingInformesPage() {
  return (
    <ProfileSeoLanding
      h1="Scouting e informes de jugadores"
      mainText="Centralizá la búsqueda y evaluación de talento mediante perfiles con datos deportivos, trayectoria, videos y estadísticas. FutbolProyect facilita el trabajo de scouts, analistas, clubes y agencias.\n\nLos informes y el material del perfil ayudan a ordenar el seguimiento profesional de cada jugador."
      h2="Jugadores para seguimiento y evaluación"
      ctaText="Crear una cuenta de scouting"
      ctaLink="/register"
    />
  );
}
