import { Metadata } from "next";
import SeoPage from "@/components/shared/SeoPage";
import OfferList from "@/components/shared/OfferList";
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
  const { t } = await getTranslation("es");
  const offers = await getOffers();

  return (
    <SeoPage
      h1={t("ofertas_trabajo_futbol_h1")}
      mainText={t("ofertas_trabajo_futbol_main_text")}
      h2={t("ofertas_trabajo_futbol_h2")}
      ctaText={t("ofertas_trabajo_futbol_cta")}
      ctaLink="/register"
    >
      <OfferList offers={offers} isHomePage={false} showApplyButton={false} />
    </SeoPage>
  );
}
