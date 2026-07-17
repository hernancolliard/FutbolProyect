import type { Metadata } from "next";
import ProfileSeoLanding from "@/components/seo/ProfileSeoLanding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Agencias y representantes de fútbol | FutbolProyect" },
  description:
    "Herramientas para agencias y representantes que buscan jugadores, gestionan talento y conectan perfiles con oportunidades en el fútbol.",
  alternates: { canonical: "/agencias/representantes" },
};

export default function AgenciasRepresentantesPage() {
  return (
    <ProfileSeoLanding
      translationPrefix="agencies_landing"
      ctaLink="/register"
    />
  );
}
