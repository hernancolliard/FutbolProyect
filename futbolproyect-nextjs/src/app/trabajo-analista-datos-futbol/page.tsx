import { Metadata } from "next";
import OfferSeoLandingContent from "@/components/seo/OfferSeoLandingContent";
import { getTranslation } from "@/lib/i18n-server";
import { Offer } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getAnalystOffers(): Promise<Offer[]> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return [];

  try {
    const res = await fetch(`${apiBaseUrl}/offers?puesto=analista`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.offers || [];
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation("es");

  return {
    title: t("trabajo_analista_datos_futbol_seo_title"),
    description: t("trabajo_analista_datos_futbol_seo_desc"),
    alternates: { canonical: "/ofertas/analistas-de-futbol" },
  };
}

export default async function TrabajoAnalistaDatosFutbolPage() {
  const offers = await getAnalystOffers();

  return (
    <OfferSeoLandingContent
      offers={offers}
      translationPrefix="trabajo_analista_datos_futbol"
      ctaKey="trabajo_analista_datos_futbol_cta"
    />
  );
}
