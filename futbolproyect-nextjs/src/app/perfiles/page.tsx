import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslation } from "@/lib/i18n-server";
import { Profile } from "@/lib/types";
import { Grid, Typography, Paper } from "@mui/material";
import FilterControls from "@/components/profile/FilterControls";
import ProfileCard from "@/components/profile/ProfileCard";
import { getApiBaseUrl } from "@/lib/api";

/* =========================
   STATIC FETCH (BUILD TIME)
========================= */

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function fetchInitialData(): Promise<{
  profiles: Profile[];
  nacionalidades: string[];
  puestos: string[];
}> {
  const [profilesRes, nacRes, puestosRes] = await Promise.all([
    fetch(`${API_URL}/profiles`, { cache: "force-cache" }),
    fetch(`${API_URL}/profiles/nacionalidades`, { cache: "force-cache" }),
    fetch(`${API_URL}/profiles/puestos`, { cache: "force-cache" }),
  ]);

  return {
    profiles: profilesRes.ok ? await profilesRes.json() : [],
    nacionalidades: nacRes.ok ? await nacRes.json() : [],
    puestos: puestosRes.ok ? await puestosRes.json() : [],
  };
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

  const { profiles, nacionalidades, puestos } = await fetchInitialData();

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
        puestos={puestos}
        initialProfiles={profiles}
      />

      <Suspense fallback={<Typography>{t("loading_profiles")}</Typography>}>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {profiles.map((profile) => (
            <Grid item key={profile.id} xs={12} sm={6} md={4} lg={3}>
              <ProfileCard profile={profile} />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Paper>
  );
}
