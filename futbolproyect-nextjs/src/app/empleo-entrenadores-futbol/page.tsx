import { Metadata } from "next";
import OfferSeoLandingContent from "@/components/seo/OfferSeoLandingContent";
import { getTranslation } from "@/lib/i18n-server";
import { Offer } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getCoachOffers(): Promise<Offer[]> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return [];

  try {
    const res = await fetch(`${apiBaseUrl}/offers?puesto=entrenador`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.offers || [];
  } catch {
    return [];
  }
}

/* ✅ SEO metadata */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation("es");

  return {
    title: t("empleo_entrenadores_futbol_seo_title"),
    description: t("empleo_entrenadores_futbol_seo_desc"),
    alternates: { canonical: "/ofertas/entrenadores" },
  };
}

/* ✅ Página */
export default async function EmpleoEntrenadoresFutbolPage() {
  const offers = await getCoachOffers();

  return (
    <OfferSeoLandingContent
      offers={offers}
      translationPrefix="empleo_entrenadores_futbol"
      ctaKey="empleo_entrenadores_futbol_cta"
    />
  );
}
