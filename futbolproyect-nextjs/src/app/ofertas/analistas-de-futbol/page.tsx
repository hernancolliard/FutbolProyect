import type { Metadata } from "next";
import OfferSeoLanding from "@/components/seo/OfferSeoLanding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Ofertas para analistas de fútbol | FutbolProyect" },
  description:
    "Encontrá trabajo para analistas de fútbol, videoanalistas y profesionales de datos en clubes y organizaciones deportivas.",
  alternates: { canonical: "/ofertas/analistas-de-futbol" },
};

export default function OfertasAnalistasPage() {
  return (
    <OfferSeoLanding
      role="analista"
      h1="Ofertas para analistas de fútbol"
      mainText="Consultá oportunidades para analistas tácticos, videoanalistas y especialistas en datos aplicados al fútbol. Conectá tu experiencia con clubes, cuerpos técnicos y agencias."
      h2="Trabajo en análisis táctico, video y datos"
    />
  );
}
