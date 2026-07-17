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
      translationPrefix="scouting_landing"
      ctaLink="/register"
    />
  );
}
