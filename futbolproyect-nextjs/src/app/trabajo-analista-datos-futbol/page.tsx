import { Metadata } from "next";
import React from "react";
import { Offer } from "@/lib/types";
import SeoPage from "@/components/shared/SeoPage";
import OfferList from "@/components/shared/OfferList";
import { getTranslation } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

async function getAnalystOffers(): Promise<Offer[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return [];

  try {
    const res = await fetch(`${apiBaseUrl}/offers?puesto=analista`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.offers || [];
  } catch (error) {
    console.error("Error fetching analyst offers:", error);
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  // SIN LLAVES {}
  const translations = await getTranslation("es");
  return {
    title:
      translations["trabajo_analista_datos_futbol_seo_title"] ||
      "Trabajo para analista de datos | FutbolProyect",
    description:
      translations["trabajo_analista_datos_futbol_seo_desc"] ||
      "Oportunidades para analistas de datos en fútbol.",
  };
}

const TrabajoAnalistaDatosFutbolPage = async () => {
  // SIN LLAVES {}
  const translations = await getTranslation("es");
  const offers = await getAnalystOffers();

  const pageContent = {
    h1:
      translations["trabajo_analista_datos_futbol_h1"] ||
      "Trabajo para analista de datos en el fútbol",
    mainText: translations["trabajo_analista_datos_futbol_main_text"] || "",
    h2:
      translations["trabajo_analista_datos_futbol_h2"] ||
      "Clubes que buscan analistas",
    ctaText: translations["trabajo_analista_datos_futbol_cta"] || "Registrate",
    ctaLink: "/register",
  };

  return (
    <SeoPage {...pageContent}>
      <OfferList offers={offers} isHomePage={false} />
    </SeoPage>
  );
};

export default TrabajoAnalistaDatosFutbolPage;
