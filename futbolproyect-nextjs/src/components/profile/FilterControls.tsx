"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Collapse,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { Profile } from "@/lib/types";
import ProfileCard from "@/components/profile/ProfileCard";
import AdBanner from "@/components/ads/AdBanner";
import ProfilesHero from "@/components/profile/ProfilesHero";
import ProfileFiltersSidebar, {
  ProfileFilters,
} from "@/components/profile/ProfileFiltersSidebar";
import { getPlayerPositionCategory } from "@/lib/profilePositions";
import { getPlayersCategoryPath } from "@/lib/profileSeoTaxonomy";
import { isProfileIndexable } from "@/lib/seoSlugs";
import { useTranslation } from "react-i18next";

interface FilterControlsProps {
  nacionalidades: string[];
  initialProfiles: Profile[];
}

const emptyFilters: ProfileFilters = {
  nombre: "",
  nacionalidad: "",
  puesto: "",
  hasVideo: false,
  hasPhotos: false,
};

const normalizeForSearch = (value?: string) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const getProfileAge = (birthDate?: string) => {
  if (!birthDate) return null;
  const parsedDate = new Date(birthDate);
  if (Number.isNaN(parsedDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const monthDiff = today.getMonth() - parsedDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < parsedDate.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
};

type ProfilesResultsProps = {
  profiles: Profile[];
  totalProfiles: number;
  onClear: () => void;
};

const ProfilesResults = memo(function ProfilesResults({
  profiles,
  totalProfiles,
  onClear,
}: ProfilesResultsProps) {
  const { t } = useTranslation("common");

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={0.5}
        sx={{ mb: 2.25 }}
      >
        <Typography sx={{ color: "#5b6a80", fontSize: ".9rem" }}>
          {t("profiles_results_count", {
            shown: profiles.length,
            total: totalProfiles,
          })}
        </Typography>
        <Typography
          sx={{ color: "#0a1930", fontWeight: 800, fontSize: ".9rem" }}
        >
          {t("available_talent")}
        </Typography>
      </Stack>

      {profiles.length ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {profiles.map((profile, index) => (
            <React.Fragment key={profile.id}>
              <ProfileCard profile={profile} />
              {(index + 1) % 8 === 0 && (
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <AdBanner placement="profiles_inline" compact />
                </Box>
              )}
            </React.Fragment>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            p: 5,
            textAlign: "center",
            bgcolor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
          }}
        >
          <Typography sx={{ color: "#0a1930", fontWeight: 900 }}>
            {t("no_profiles_with_filters")}
          </Typography>
          <Button onClick={onClear} sx={{ mt: 1 }}>
            {t("clear_filters")}
          </Button>
        </Box>
      )}
    </Box>
  );
});

export default function FilterControls({
  nacionalidades,
  initialProfiles,
}: FilterControlsProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const agesInProfiles = useMemo(
    () =>
      initialProfiles
        .map((profile) => getProfileAge(profile.fecha_de_nacimiento))
        .filter((age): age is number => age !== null),
    [initialProfiles],
  );

  const hasAgeData = agesInProfiles.length > 0;
  const ageBounds = useMemo<[number, number]>(() => {
    if (!agesInProfiles.length) return [12, 45];
    const minAge = Math.max(0, Math.min(...agesInProfiles));
    const maxAge = Math.max(minAge + 1, Math.max(...agesInProfiles));
    return [minAge, maxAge];
  }, [agesInProfiles]);

  const [draftFilters, setDraftFilters] =
    useState<ProfileFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<ProfileFilters>(emptyFilters);
  const [draftAgeRange, setDraftAgeRange] =
    useState<[number, number]>(ageBounds);
  const [appliedAgeRange, setAppliedAgeRange] =
    useState<[number, number]>(ageBounds);
  const [isAgeFilterActive, setIsAgeFilterActive] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!isAgeFilterActive) {
      setDraftAgeRange(ageBounds);
      setAppliedAgeRange(ageBounds);
    }
  }, [ageBounds, isAgeFilterActive]);

  const applyFilters = useCallback(() => {
    const categoryPath = getPlayersCategoryPath(
      draftFilters.puesto,
      draftFilters.nacionalidad,
    );
    if (categoryPath) {
      router.push(categoryPath);
      return;
    }
    setAppliedFilters(draftFilters);
    setAppliedAgeRange(draftAgeRange);
    setShowMobileFilters(false);
  }, [draftAgeRange, draftFilters, router]);

  const clearFilters = useCallback(() => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setDraftAgeRange(ageBounds);
    setAppliedAgeRange(ageBounds);
    setIsAgeFilterActive(false);
  }, [ageBounds]);

  const handleAgeChange = useCallback((range: [number, number]) => {
    setDraftAgeRange(range);
    setIsAgeFilterActive(true);
  }, []);

  const handlePositionChange = useCallback((puesto: string) => {
    setDraftFilters((currentFilters) => {
      const nextFilters = { ...currentFilters, puesto };
      setAppliedFilters(nextFilters);
      return nextFilters;
    });
  }, []);

  const filteredProfiles = useMemo(
    () =>
      initialProfiles.filter((profile) => {
        const searchTerm = normalizeForSearch(appliedFilters.nombre);
        const fullName = normalizeForSearch(
          `${profile.nombre || ""} ${profile.apellido || ""}`,
        );
        const matchName = !searchTerm || fullName.includes(searchTerm);
        const matchNationality =
          !appliedFilters.nacionalidad ||
          profile.nacionalidad === appliedFilters.nacionalidad;
        const matchPosition =
          !appliedFilters.puesto ||
          getPlayerPositionCategory(profile.posicion_principal) ===
            appliedFilters.puesto;
        const profileAge = getProfileAge(profile.fecha_de_nacimiento);
        const matchAge =
          !isAgeFilterActive ||
          (profileAge !== null &&
            profileAge >= appliedAgeRange[0] &&
            profileAge <= appliedAgeRange[1]);
        const matchVideo = !appliedFilters.hasVideo || Boolean(profile.has_video);
        const matchPhotos = !appliedFilters.hasPhotos || Boolean(profile.has_photos);

        return (
          matchName &&
          matchNationality &&
          matchPosition &&
          matchAge &&
          matchVideo &&
          matchPhotos
        );
      }),
    [appliedAgeRange, appliedFilters, initialProfiles, isAgeFilterActive],
  );

  const metrics = useMemo(() => {
    const representedPositions = new Set(
      initialProfiles
        .map((profile) =>
          getPlayerPositionCategory(profile.posicion_principal),
        )
        .filter(Boolean),
    ).size;
    const completeProfiles = initialProfiles.filter(
      (profile) => profile.foto_perfil_url && profile.cv_url,
    ).length;

    return [
      { value: initialProfiles.length, label: t("available_profiles_metric") },
      { value: nacionalidades.length, label: t("nationalities_metric") },
      { value: representedPositions, label: t("represented_positions_metric") },
      { value: completeProfiles, label: t("complete_profiles_metric") },
    ];
  }, [initialProfiles, nacionalidades.length, t]);

  const categoryLinks = useMemo(() => {
    const categories = new Map<string, { label: string; count: number }>();
    initialProfiles.filter(isProfileIndexable).forEach((profile) => {
      const path = getPlayersCategoryPath(
        profile.posicion_principal,
        profile.nacionalidad,
      );
      if (!path) return;
      const label = `${getPlayerPositionCategory(profile.posicion_principal)} · ${profile.nacionalidad}`;
      const current = categories.get(path);
      categories.set(path, { label, count: (current?.count || 0) + 1 });
    });
    return [...categories.entries()]
      .filter(([, category]) => category.count >= 3)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 12);
  }, [initialProfiles]);

  const filtersSidebar = (
    <ProfileFiltersSidebar
      filters={draftFilters}
      nacionalidades={nacionalidades}
      ageRange={draftAgeRange}
      ageBounds={ageBounds}
      hasAgeData={hasAgeData}
      onChange={setDraftFilters}
      onAgeChange={handleAgeChange}
      onApply={applyFilters}
      onClear={clearFilters}
    />
  );

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh", pb: { xs: 7, md: 10 } }}>
      <ProfilesHero
        activePosition={draftFilters.puesto}
        metrics={metrics}
        onPositionChange={handlePositionChange}
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 11 } }}>
        <Box
          component="section"
          aria-labelledby="profiles-seo-intro-title"
          sx={{
            mb: 3,
            p: { xs: 2.25, md: 3 },
            bgcolor: "#fff",
            border: "1px solid #dfe6ef",
            borderRadius: 2.5,
          }}
        >
          <Typography
            id="profiles-seo-intro-title"
            component="h2"
            sx={{ color: "#0a1930", fontSize: "1.35rem", fontWeight: 900 }}
          >
            {t("profiles_seo_intro_title")}
          </Typography>
          <Typography sx={{ mt: 1, color: "#5e6c81", lineHeight: 1.7 }}>
            {t("profiles_seo_intro_text")}
          </Typography>
          <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
            <Button component={Link} href="/register" size="small">
              {t("create_sports_profile")}
            </Button>
            <Button component={Link} href="/all-offers" size="small">
              {t("view_opportunities")}
            </Button>
            <Button component={Link} href="/create-offer" size="small">
              {t("publish_offer")}
            </Button>
          </Stack>
          {categoryLinks.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: "#0a1930", fontWeight: 800, fontSize: ".9rem" }}>
                {t("explore_players_by_position_country", "Explorar jugadores por posición y país")}
              </Typography>
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                {categoryLinks.map(([path, category]) => (
                  <Button key={path} component={Link} href={path} size="small" variant="outlined">
                    {category.label} ({category.count})
                  </Button>
                ))}
                <Button component={Link} href="/jugadores" size="small">
                  {t("view_all_categories", "Ver todas")}
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        <AdBanner placement="profiles_top" />

        <Button
          fullWidth
          variant="outlined"
          startIcon={<TuneRoundedIcon />}
          onClick={() => setShowMobileFilters((value) => !value)}
          sx={{
            display: { xs: "flex", md: "none" },
            mb: 2.5,
            py: 1.2,
            bgcolor: "#fff",
            borderColor: "#d9e2ef",
            fontWeight: 800,
          }}
        >
          {showMobileFilters ? t("hide_filters") : t("show_filters")}
        </Button>

        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <Collapse in={showMobileFilters}>
            <Box sx={{ mb: 3 }}>{filtersSidebar}</Box>
          </Collapse>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "260px minmax(0, 1fr)" },
            gap: { xs: 3, md: 3.5 },
            alignItems: "start",
          }}
        >
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            {filtersSidebar}
          </Box>

          <ProfilesResults
            profiles={filteredProfiles}
            totalProfiles={initialProfiles.length}
            onClear={clearFilters}
          />
        </Box>
      </Container>
    </Box>
  );
}
