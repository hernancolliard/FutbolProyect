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
      h1="Agencias y representantes de fútbol"
      mainText="FutbolProyect permite a agencias y representantes descubrir jugadores, revisar perfiles deportivos y conectar talento con clubes y oportunidades.\n\nPublicá búsquedas, evaluá trayectoria y material audiovisual, y ampliá tu red profesional dentro del fútbol."
      h2="Perfiles para agencias y representantes"
      ctaText="Registrar mi agencia"
      ctaLink="/register"
    />
  );
}
