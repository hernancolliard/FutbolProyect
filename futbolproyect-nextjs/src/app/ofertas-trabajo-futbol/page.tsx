import { Metadata } from "next";
import OfferSeoLandingContent from "@/components/seo/OfferSeoLandingContent";
import { getTranslation } from "@/lib/i18n-server";
import { Offer } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getOffers(): Promise<Offer[]> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return [];

  try {
    const res = await fetch(`${apiBaseUrl}/offers`, { cache: "no-store" });
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
    title: t("ofertas_trabajo_futbol_seo_title"),
    description: t("ofertas_trabajo_futbol_seo_desc"),
    alternates: { canonical: "/ofertas-trabajo-futbol" },
  };
}

export default async function OfertasTrabajoFutbolPage() {
  const offers = await getOffers();

  return (
    <OfferSeoLandingContent
      offers={offers}
      translationPrefix="ofertas_trabajo_futbol"
      ctaKey="ofertas_trabajo_futbol_cta"
    />
  );
}
