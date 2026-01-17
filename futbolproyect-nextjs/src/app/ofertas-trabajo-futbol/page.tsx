// futbolproyect-nextjs/src/app/ofertas-trabajo-futbol/page.tsx
import { Metadata } from "next";
import React from "react";
import { Offer } from "@/lib/types";
import SeoPage from "@/components/shared/SeoPage";
import OfferList from "@/components/shared/OfferList";
import { getTranslation } from "@/lib/i18n-server";

// CORRECCIÓN: Forzamos renderizado dinámico para evitar fetch en build time
export const dynamic = "force-dynamic";

// Function to fetch offers
async function getOffers(): Promise<Offer[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    // En build time esto puede no estar definido, pero con force-dynamic no importa tanto
    return [];
  }
  try {
    // Quitamos revalidate porque en modo dinámico queremos datos frescos o controlados por cache-control
    const res = await fetch(`${apiBaseUrl}/offers`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.offers || [];
  } catch (error) {
    console.error("Error fetching offers:", error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const { translations } = await getTranslation("es");
  return {
    title: translations["ofertas_trabajo_futbol_seo_title"],
    description: translations["ofertas_trabajo_futbol_seo_desc"],
  };
}

const OfertasTrabajoFutbolPage = async () => {
  const { translations } = await getTranslation("es");
  const offers = await getOffers();

  const pageContent = {
    h1: translations["ofertas_trabajo_futbol_h1"],
    mainText: translations["ofertas_trabajo_futbol_main_text"],
    h2: translations["ofertas_trabajo_futbol_h2"],
    ctaText: translations["ofertas_trabajo_futbol_cta"],
    ctaLink: "/register",
  };

  return (
    <SeoPage {...pageContent}>
      <OfferList offers={offers} isHomePage={false} />
    </SeoPage>
  );
};

export default OfertasTrabajoFutbolPage;
