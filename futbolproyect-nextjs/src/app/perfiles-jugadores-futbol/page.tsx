import { Metadata } from "next";
import SeoPage from "@/components/shared/SeoPage";
import { getTranslation } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation("es");

  return {
    title: t("perfiles_jugadores_futbol_seo_title"),
    description: t("perfiles_jugadores_futbol_seo_desc"),
  };
}

export default async function PerfilesJugadoresFutbolPage() {
  const { t } = await getTranslation("es");

  return (
    <SeoPage
      h1={t("perfiles_jugadores_futbol_h1")}
      mainText={t("perfiles_jugadores_futbol_main_text")}
      h2={t("perfiles_jugadores_futbol_h2")}
      ctaText={t("perfiles_jugadores_futbol_cta")}
      ctaLink="/register"
    />
  );
}
