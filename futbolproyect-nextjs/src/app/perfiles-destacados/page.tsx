import { Suspense } from "react";
import { type Metadata } from "next";
import { getTranslation } from "@/lib/i18n-server";
import { Profile } from "@/lib/types";
import { Grid, Typography, Paper } from "@mui/material";
import FilterControls from "@/components/profile/FilterControls";
import ProfileCard from "@/components/profile/ProfileCard";
// Función auxiliar para obtener la URL correcta en el servidor
const getBaseUrl = () => {
  // Si existe una URL pública definida, úsala
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  // IMPORTANTE: En Render, usar process.env.PORT. Si no existe, usar 5000 (local).
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};
const fetchAllProfiles = async (filters: {
  nacionalidad?: string;
  puesto?: string;
}): Promise<Profile[]> => {
  const apiUrl = getBaseUrl(); // <--- Usar la función dinámica
  const query = new URLSearchParams(
    filters as Record<string, string>,
  ).toString();

  try {
    // Cambiado de /api/profiles/destacados a /api/profiles/all
    const res = await fetch(`${apiUrl}/api/profiles/all?${query}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("Error fetching profiles:", res.status);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Network error:", error);
    return [];
  }
};

const fetchNacionalidades = async (): Promise<string[]> => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const res = await fetch(`${apiUrl}/api/profiles/nacionalidades`, {
    next: { revalidate: 86400 },
  }); // revalidate once a day
  if (!res.ok) return [];
  return res.json();
};

const fetchPuestos = async (): Promise<string[]> => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const res = await fetch(`${apiUrl}/api/profiles/puestos`, {
    next: { revalidate: 86400 },
  }); // revalidate once a day
  if (!res.ok) return [];
  return res.json();
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const { t } = await getTranslation(searchParams?.lang as string);
  return {
    title: t("featured_profiles_seo_title"),
    description: t("featured_profiles_seo_desc"),
  };
}

// A separate component for the main content to wrap it in Suspense
async function ProfilesList({
  nacionalidad,
  puesto,
  lang,
}: {
  nacionalidad?: string;
  puesto?: string;
  lang?: string;
}) {
  const profiles = await fetchAllProfiles({ nacionalidad, puesto });
  const { t } = await getTranslation(lang);

  console.log("Profiles in ProfilesList:", profiles); // DEBUG LOG

  if (profiles.length === 0) {
    return <Typography>{t("no_featured_profiles_filters")}</Typography>;
  }

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {profiles.map((profile) => (
        <Grid item key={profile.id} xs={12} sm={6} md={4} lg={3}>
          <ProfileCard profile={profile} />
        </Grid>
      ))}
    </Grid>
  );
}

export default async function FeaturedProfilesPage({
  searchParams,
}: {
  searchParams: { nacionalidad?: string; puesto?: string; lang?: string };
}) {
  const { t } = await getTranslation(searchParams?.lang);
  const [nacionalidades, puestos] = await Promise.all([
    fetchNacionalidades(),
    fetchPuestos(),
  ]);

  const { nacionalidad, puesto, lang } = searchParams;

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, m: { xs: 1, md: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t("featured_profiles_title")}
      </Typography>
      <Typography paragraph>{t("featured_profiles_desc")}</Typography>

      <FilterControls
        nacionalidades={nacionalidades}
        puestos={puestos}
        initialFilters={{ nacionalidad, puesto }}
      />

      <Suspense fallback={<Typography>{t("loading_profiles")}</Typography>}>
        <ProfilesList nacionalidad={nacionalidad} puesto={puesto} lang={lang} />
      </Suspense>
    </Paper>
  );
}
