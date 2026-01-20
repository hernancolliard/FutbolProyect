import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

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
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <h1>{t["empleo_entrenadores_futbol_h1"]}</h1>

      {t["empleo_entrenadores_futbol_main_text"]
        .split("\n\n")
        .map((p: string, i: number) => (
          <p key={i}>{p}</p>
        ))}

      <h2>{t["empleo_entrenadores_futbol_h2"]}</h2>

      <p>
        <a href="/register">{t["empleo_entrenadores_futbol_cta"]}</a>
      </p>
    </main>
  );
}
