import { Metadata } from "next";
import SeoPage from "@/components/shared/SeoPage";
import { getTranslation } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation("es");
  return {
    title: t["empleo_entrenadores_futbol_seo_title"],
    description: t["empleo_entrenadores_futbol_seo_desc"],
  };
}

export default async function EmpleoEntrenadoresFutbolPage() {
  const t = await getTranslation("es");

  return (
    <SeoPage
      h1={t["empleo_entrenadores_futbol_h1"]}
      mainText={t["empleo_entrenadores_futbol_main_text"]}
      h2={t["empleo_entrenadores_futbol_h2"]}
      ctaText={t["empleo_entrenadores_futbol_cta"]}
      ctaLink="/register"
    />
  );
}
