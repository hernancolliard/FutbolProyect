import { Metadata } from "next";
import React from "react";
import { Offer } from "@/lib/types";
import SeoPage from "@/components/shared/SeoPage";
import OfferList from "@/components/shared/OfferList";
import { getTranslation } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

async function getCoachOffers(): Promise<Offer[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return [];

  try {
    const res = await fetch(`${apiBaseUrl}/offers?puesto=entrenador`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.offers || [];
  } catch (error) {
    console.error("Error fetching coach offers:", error);
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  // CORRECCIÓN: Obtenemos el objeto directo sin desestructurar
  const translations = await getTranslation("es");

  return {
    title:
      translations["empleo_entrenadores_futbol_seo_title"] ||
      "Empleo para entrenadores de fútbol | Oportunidades en clubes",
    description:
      translations["empleo_entrenadores_futbol_seo_desc"] ||
      "Encontrá empleo para entrenadores de fútbol en clubes y academias.",
  };
}

const EmpleoEntrenadoresFutbolPage = async () => {
  // CORRECCIÓN: Obtenemos el objeto directo
  const translations = await getTranslation("es");
  const offers = await getCoachOffers();

  // Ahora 'translations' tiene todos los datos, por lo que se mostrará el texto largo de common.json
  const pageContent = {
    h1:
      translations["empleo_entrenadores_futbol_h1"] ||
      "Empleo para entrenadores de fútbol",
    mainText: translations["empleo_entrenadores_futbol_main_text"] || "",
    h2:
      translations["empleo_entrenadores_futbol_h2"] ||
      "Trabajo para entrenadores de fútbol",
    ctaText: translations["empleo_entrenadores_futbol_cta"] || "Registrate",
    ctaLink: "/register",
  };

  return (
    <SeoPage {...pageContent}>
      <OfferList offers={offers} isHomePage={false} />
    </SeoPage>
  );
};

export default EmpleoEntrenadoresFutbolPage;
