import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
import { Profile } from "@/lib/types";
import FilterControls from "@/components/profile/FilterControls";
import { getApiBaseUrl } from "@/lib/api";

/* =========================
   STATIC FETCH (BUILD TIME)
========================= */

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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Perfiles de Fútbol Profesional | FutbolProyect",
    description:
      "Explorá perfiles de futbolistas profesionales, jugadores libres y talentos emergentes en FutbolProyect.",
    alternates: {
      canonical: "/perfiles",
    },
  };
}

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
