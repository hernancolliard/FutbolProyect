// futbolproyect-nextjs/src/app/perfiles-jugadores-futbol/page.tsx
import React from "react";
import { Profile } from "@/lib/types";
import SeoPage from "@/components/shared/SeoPage";
import ProfileList from "@/components/shared/ProfileList";
import { getTranslation } from "@/lib/i18n-server";
import { Metadata } from "next";

// CORRECCIÓN: Forzamos renderizado dinámico
export const dynamic = "force-dynamic";

async function getProfiles(): Promise<Profile[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return [];

  try {
    const res = await fetch(`${apiBaseUrl}/profiles`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { translations } = await getTranslation("es");
  return {
    title: translations["perfiles_jugadores_futbol_seo_title"],
    description: translations["perfiles_jugadores_futbol_seo_desc"],
  };
}

const PerfilesJugadoresFutbolPage = async () => {
  const { translations } = await getTranslation("es");
  const profiles = await getProfiles();

  const pageContent = {
    h1: translations["perfiles_jugadores_futbol_h1"],
    mainText: translations["perfiles_jugadores_futbol_main_text"],
    h2: translations["perfiles_jugadores_futbol_h2"],
    ctaText: translations["perfiles_jugadores_futbol_cta"],
    ctaLink: "/register",
  };

  return (
    <SeoPage {...pageContent}>
      <ProfileList profiles={profiles} />
    </SeoPage>
  );
};

export default PerfilesJugadoresFutbolPage;
