import { Metadata } from "next";
import SeoPage from "@/components/shared/SeoPage";
import OfferList from "@/components/shared/OfferList";
import { getTranslation } from "@/lib/i18n-server";
import { Offer } from "@/lib/types";

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
  };
}

/* ✅ Página */
export default async function EmpleoEntrenadoresFutbolPage() {
  const { t } = await getTranslation("es");
  const offers = await getCoachOffers();

  return (
    <SeoPage
      h1={t("empleo_entrenadores_futbol_h1")}
      mainText={t("empleo_entrenadores_futbol_main_text")}
      h2={t("empleo_entrenadores_futbol_h2")}
      ctaText={t("empleo_entrenadores_futbol_cta")}
      ctaLink="/register"
    >
      <OfferList offers={offers} isHomePage={false} />
    </SeoPage>
  );
}
