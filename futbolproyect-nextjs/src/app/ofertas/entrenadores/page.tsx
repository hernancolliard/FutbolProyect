import type { Metadata } from "next";
import OfferSeoLanding from "@/components/seo/OfferSeoLanding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Ofertas para entrenadores de fútbol | FutbolProyect" },
  description:
    "Buscá trabajo como entrenador de fútbol y conectá con clubes, academias y proyectos que necesitan cuerpos técnicos.",
  alternates: { canonical: "/ofertas/entrenadores" },
};

export default function OfertasEntrenadoresPage() {
  return (
    <OfferSeoLanding
      role="entrenador"
      translationPrefix="coach_offers_landing"
    />
  );
}
