import { Metadata } from "next";
import SeoPage from "@/components/shared/SeoPage";
import { getTranslation } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation("es");
  return {
    title: t["ofertas_trabajo_futbol_seo_title"],
    description: t["ofertas_trabajo_futbol_seo_desc"],
  };
}

export default async function OfertasTrabajoFutbolPage() {
  const t = await getTranslation("es");

  return (
    <SeoPage
      h1={t["ofertas_trabajo_futbol_h1"]}
      mainText={t["ofertas_trabajo_futbol_main_text"]}
      h2={t["ofertas_trabajo_futbol_h2"]}
      ctaText={t["ofertas_trabajo_futbol_cta"]}
      ctaLink="/register"
    />
  );
}
