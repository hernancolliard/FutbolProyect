import type { Metadata } from "next";
import { Profile } from "@/lib/types";
import FilterControls from "@/components/profile/FilterControls";
import { getApiBaseUrl } from "@/lib/api";

// El orden de los perfiles depende de suscripciones vigentes, por lo que debe
// consultarse en cada solicitud y no reutilizar una lista desactualizada.
export const dynamic = "force-dynamic";

const API_URL = getApiBaseUrl();

async function fetchInitialData(): Promise<{
  profiles: Profile[];
  nacionalidades: string[];
}> {
  try {
    const [profilesRes, nacRes] = await Promise.all([
      fetch(`${API_URL}/profiles`, { cache: "no-store" }),
      fetch(`${API_URL}/profiles/nacionalidades`, { cache: "no-store" }),
    ]);

    return {
      profiles: profilesRes.ok ? await profilesRes.json() : [],
      nacionalidades: nacRes.ok ? await nacRes.json() : [],
    };
  } catch (error) {
    console.error("Error fetching initial profile data:", error);
    return {
      profiles: [],
      nacionalidades: [],
    };
  }
}

/* =========================
   SEO ESTÁTICO
========================= */

export const metadata: Metadata = {
  title: {
    absolute: "Perfiles de futbolistas y profesionales | FutbolProyect",
  },
  description:
    "Explorá perfiles de futbolistas, entrenadores y profesionales del fútbol. Consultá trayectoria, posición, nacionalidad y material deportivo.",
  alternates: { canonical: "/perfiles" },
  openGraph: {
    type: "website",
    url: "/perfiles",
    title: "Perfiles de futbolistas y profesionales | FutbolProyect",
    description:
      "Encontrá jugadores y profesionales del fútbol con perfiles deportivos, trayectoria, videos y datos de contacto.",
    siteName: "FutbolProyect",
  },
};

/* =========================
   PAGE
========================= */

export default async function AllProfilesPage() {
  const { profiles, nacionalidades } = await fetchInitialData();

  return (
    <FilterControls
      nacionalidades={nacionalidades}
      initialProfiles={profiles}
    />
  );
}
