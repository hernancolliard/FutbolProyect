import { Metadata } from "next";
import ProfileSeoLanding from "@/components/seo/ProfileSeoLanding";
import { getTranslation } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation("es");

  return {
    title: t("perfiles_jugadores_futbol_seo_title"),
    description: t("perfiles_jugadores_futbol_seo_desc"),
    alternates: { canonical: "/perfiles/jugadores" },
  };
}

export default async function PerfilesJugadoresFutbolPage() {
  return (
    <ProfileSeoLanding
      translationPrefix="perfiles_jugadores_futbol"
      ctaLink="/register"
    />
  );
}
