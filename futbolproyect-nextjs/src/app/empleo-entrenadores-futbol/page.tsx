// futbolproyect-nextjs/src/app/empleo-entrenadores-futbol/page.tsx
import { Metadata } from "next";
import React from "react";
import { Offer } from "@/lib/types";
import SeoPage from "@/components/shared/SeoPage";
import OfferList from "@/components/shared/OfferList";
import { getTranslation } from "@/lib/i18n-server";

// 1. IMPORTANTE: Esto le dice a Next.js que no intente generar la página estática en el build
export const dynamic = "force-dynamic";

// Function to fetch offers for coaches
async function getCoachOffers(): Promise<Offer[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    // Si no hay URL (en build time), devolvemos array vacío en lugar de romper
    return [];
  }

  try {
    // 2. Usamos cache: 'no-store' para asegurar datos frescos y evitamos revalidate en modo dinámico
    const res = await fetch(`${apiBaseUrl}/offers?puesto=entrenador`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Failed to fetch coach offers during render");
      return [];
    }
    const data = await res.json();
    return data.offers || [];
  } catch (error) {
    console.error("Error fetching coach offers:", error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const { translations } = await getTranslation("es");
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
  const { translations } = await getTranslation("es");
  const offers = await getCoachOffers();

  const pageContent = {
    h1:
      translations["empleo_entrenadores_futbol_h1"] ||
      "Empleo para entrenadores de fútbol",
    mainText:
      translations["empleo_entrenadores_futbol_main_text"] ||
      `Los entrenadores de fútbol cumplen un rol central...`,
    h2:
      translations["empleo_entrenadores_futbol_h2"] ||
      "Trabajo para entrenadores de fútbol",
    ctaText:
      translations["empleo_entrenadores_futbol_cta"] ||
      "Registrate y accedé a empleo para entrenadores de fútbol",
    ctaLink: "/register",
  };

  return (
    <SeoPage
      {...pageContent}
      items={offers}
      renderItems={(items) => (
        <OfferList offers={items as Offer[]} isHomePage={false} />
      )}
    />
  );
};

export default EmpleoEntrenadoresFutbolPage;
