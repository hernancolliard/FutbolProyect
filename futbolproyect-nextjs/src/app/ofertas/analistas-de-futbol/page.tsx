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
      translationPrefix="analyst_offers_landing"
    />
  );
}
