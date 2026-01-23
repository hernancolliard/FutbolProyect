import { Suspense } from "react";
import { type Metadata } from "next";
import { getTranslation } from "@/lib/i18n-server";
import { Profile } from "@/lib/types";
import { Grid, Typography, Paper } from "@mui/material";
import FilterControls from "@/components/profile/FilterControls";
import ProfileCard from "@/components/profile/ProfileCard";
import { getApiBaseUrl } from "@/lib/api";

// =========================
// FETCH FUNCTIONS
// =========================

const fetchAllProfiles = async (filters: {
  nacionalidad?: string;
  puesto?: string;
}): Promise<Profile[]> => {
  const apiUrl = getApiBaseUrl();

  const query = new URLSearchParams(
    filters as Record<string, string>,
  ).toString();

  const res = await fetch(`${apiUrl}/api/profiles?${query}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  return res.json();
};

const fetchNacionalidades = async (): Promise<string[]> => {
  const apiUrl = getApiBaseUrl();

  const res = await fetch(`${apiUrl}/api/profiles/nacionalidades`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];
  return res.json();
};

const fetchPuestos = async (): Promise<string[]> => {
  const apiUrl = getApiBaseUrl();

  const res = await fetch(`${apiUrl}/api/profiles/puestos`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];
  return res.json();
};

// =========================
// SEO METADATA
// =========================

export async function generateMetadata({
  searchParams,
}: {
  searchParams: {
    nacionalidad?: string;
    puesto?: string;
    lang?: string;
  };
}): Promise<Metadata> {
  const { t } = await getTranslation(searchParams?.lang);

  let title = t("all_profiles_seo_title");
  let description = t("all_profiles_seo_desc");

  if (searchParams?.puesto) {
    title = `${searchParams.puesto} de Fútbol | FutbolProyect`;
    description = `Perfiles de ${searchParams.puesto} de fútbol disponibles en FutbolProyect.`;
  }

  if (searchParams?.puesto && searchParams?.nacionalidad) {
    title = `${searchParams.puesto} de Fútbol en ${searchParams.nacionalidad} | FutbolProyect`;
    description = `Perfiles de ${searchParams.puesto} de fútbol en ${searchParams.nacionalidad}.`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: "/perfiles",
    },
  };
}

// =========================
// PROFILES LIST
// =========================

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

  if (profiles.length === 0) {
    return <Typography>{t("no_profiles_filters")}</Typography>;
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

// =========================
// PAGE
// =========================

export default async function AllProfilesPage({
  searchParams,
}: {
  searchParams: {
    nacionalidad?: string;
    puesto?: string;
    lang?: string;
  };
}) {
  const { t } = await getTranslation(searchParams?.lang);

  const [nacionalidades, puestos] = await Promise.all([
    fetchNacionalidades(),
    fetchPuestos(),
  ]);

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
        initialFilters={{
          nacionalidad: searchParams?.nacionalidad,
          puesto: searchParams?.puesto,
        }}
      />

      <Suspense fallback={<Typography>{t("loading_profiles")}</Typography>}>
        <ProfilesList
          nacionalidad={searchParams?.nacionalidad}
          puesto={searchParams?.puesto}
          lang={searchParams?.lang}
        />
      </Suspense>
    </Paper>
  );
}
