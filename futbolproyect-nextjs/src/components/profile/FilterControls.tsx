"use client";

import React, { useEffect, useMemo, useState } from "react";
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

interface FilterControlsProps {
  nacionalidades: string[];
  initialProfiles: Profile[];
}

const emptyFilters: ProfileFilters = {
  nombre: "",
  nacionalidad: "",
  puesto: "",
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

export default function FilterControls({
  nacionalidades,
  initialProfiles,
}: FilterControlsProps) {
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

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setAppliedAgeRange(draftAgeRange);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setDraftAgeRange(ageBounds);
    setAppliedAgeRange(ageBounds);
    setIsAgeFilterActive(false);
  };

  const handleAgeChange = (range: [number, number]) => {
    setDraftAgeRange(range);
    setIsAgeFilterActive(true);
  };

  const handlePositionChange = (puesto: string) => {
    const next = { ...draftFilters, puesto };
    setDraftFilters(next);
    setAppliedFilters(next);
  };

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

        return matchName && matchNationality && matchPosition && matchAge;
      }),
    [appliedAgeRange, appliedFilters, initialProfiles, isAgeFilterActive],
  );

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
  const metrics = [
    { value: initialProfiles.length, label: "Perfiles disponibles" },
    { value: nacionalidades.length, label: "Nacionalidades" },
    { value: representedPositions, label: "Posiciones representadas" },
    { value: completeProfiles, label: "Perfiles completos" },
  ];

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
          {showMobileFilters ? "Ocultar filtros" : "Mostrar filtros"}
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

          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={0.5}
              sx={{ mb: 2.25 }}
            >
              <Typography sx={{ color: "#5b6a80", fontSize: ".9rem" }}>
                Mostrando {filteredProfiles.length} de {initialProfiles.length} perfiles
              </Typography>
              <Typography
                sx={{ color: "#0a1930", fontWeight: 800, fontSize: ".9rem" }}
              >
                Talento disponible
              </Typography>
            </Stack>

            {filteredProfiles.length ? (
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
                {filteredProfiles.map((profile, index) => (
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
                  No encontramos perfiles con estos filtros
                </Typography>
                <Button onClick={clearFilters} sx={{ mt: 1 }}>
                  Limpiar filtros
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
