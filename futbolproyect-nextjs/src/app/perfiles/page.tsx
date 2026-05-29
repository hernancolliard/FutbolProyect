import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
import { getTranslation } from "@/lib/i18n-server";
import { Profile } from "@/lib/types";
import { Typography, Paper } from "@mui/material";
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
  const { t } = await getTranslation("es");

  const { profiles, nacionalidades } = await fetchInitialData();

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, m: { xs: 1, md: 2 } }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: "center" }}
      >
        {t("all_profiles_title")}
      </Typography>

      <Typography paragraph>{t("all_profiles_desc")}</Typography>

      <FilterControls
        nacionalidades={nacionalidades}
        initialProfiles={profiles}
      />
    </Paper>
  );
}
