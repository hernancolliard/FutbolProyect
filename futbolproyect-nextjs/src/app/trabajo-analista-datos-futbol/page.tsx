import { Metadata } from "next";
import SeoPage from "@/components/shared/SeoPage";
import { getTranslation } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation("es");
  return {
    title: t["trabajo_analista_datos_futbol_seo_title"],
    description: t["trabajo_analista_datos_futbol_seo_desc"],
  };
}

export default async function TrabajoAnalistaDatosFutbolPage() {
  const t = await getTranslation("es");

  return (
    <SeoPage
      h1={t["trabajo_analista_datos_futbol_h1"]}
      mainText={t["trabajo_analista_datos_futbol_main_text"]}
      h2={t["trabajo_analista_datos_futbol_h2"]}
      ctaText={t["trabajo_analista_datos_futbol_cta"]}
      ctaLink="/register"
    />
  );
}
