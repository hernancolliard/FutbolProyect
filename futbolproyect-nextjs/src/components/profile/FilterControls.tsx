"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Profile } from "@/lib/types";
import ProfileCard from "@/components/profile/ProfileCard";
import AdBanner from "@/components/ads/AdBanner";
import {
  getPlayerPositionCategory,
  PLAYER_POSITION_OPTIONS,
} from "@/lib/profilePositions";

interface FilterControlsProps {
  nacionalidades: string[];
  initialProfiles: Profile[];
}

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
  const { t } = useTranslation();

  const agesInProfiles = useMemo(
    () =>
      initialProfiles
        .map((profile) => getProfileAge(profile.fecha_de_nacimiento))
        .filter((age): age is number => age !== null),
    [initialProfiles],
  );

  const hasAgeData = agesInProfiles.length > 0;

  const ageBounds = useMemo<[number, number]>(() => {
    if (agesInProfiles.length === 0) return [12, 45];

    const minAge = Math.max(0, Math.min(...agesInProfiles));
    const maxAge = Math.max(minAge + 1, Math.max(...agesInProfiles));

    return [minAge, maxAge];
  }, [agesInProfiles]);

  const [filters, setFilters] = useState({
    nombre: "",
    nacionalidad: "",
    puesto: "",
  });
  const [ageRange, setAgeRange] = useState<[number, number]>(ageBounds);
  const [isAgeFilterActive, setIsAgeFilterActive] = useState(false);

  useEffect(() => {
    if (!isAgeFilterActive) {
      setAgeRange(ageBounds);
    }
  }, [ageBounds, isAgeFilterActive]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFilters((prev) => ({
      ...prev,
      nombre: value,
    }));
  };

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleAgeRangeChange = (_event: Event, value: number | number[]) => {
    if (!hasAgeData) return;
    if (!Array.isArray(value)) return;
    setAgeRange([value[0], value[1]]);
    setIsAgeFilterActive(true);
  };

  const clearFilters = () => {
    setFilters({ nombre: "", nacionalidad: "", puesto: "" });
    setAgeRange(ageBounds);
    setIsAgeFilterActive(false);
  };

  const filteredProfiles = useMemo(() => {
    return initialProfiles.filter((profile) => {
      const searchTerm = normalizeForSearch(filters.nombre);
      const fullName = normalizeForSearch(
        `${profile.nombre || ""} ${profile.apellido || ""}`,
      );
      const matchName = !searchTerm || fullName.includes(searchTerm);

      const matchNac =
        !filters.nacionalidad || profile.nacionalidad === filters.nacionalidad;

      const matchPuesto =
        !filters.puesto ||
        getPlayerPositionCategory(profile.posicion_principal) === filters.puesto;

      const profileAge = getProfileAge(profile.fecha_de_nacimiento);
      const matchAge =
        !isAgeFilterActive ||
        (profileAge !== null &&
          profileAge >= ageRange[0] &&
          profileAge <= ageRange[1]);

      return matchName && matchNac && matchPuesto && matchAge;
    });
  }, [ageRange, filters, initialProfiles, isAgeFilterActive]);

  return (
    <>
      {/* ===== FILTROS ===== */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            name="nombre"
            value={filters.nombre}
            onChange={handleNameChange}
            label={t("filter_by_name", "Buscar por nombre")}
            placeholder={t("filter_by_name_placeholder", "Nombre o apellido")}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>
              {t("filter_by_nationality", "Filtrar por nacionalidad")}
            </InputLabel>
            <Select
              name="nacionalidad"
              value={filters.nacionalidad}
              onChange={handleFilterChange}
              label={t("filter_by_nationality", "Filtrar por nacionalidad")}
            >
              <MenuItem value="">
                <em>{t("all_nationalities", "Todas")}</em>
              </MenuItem>
              {nacionalidades.map((nac) => (
                <MenuItem key={nac} value={nac}>
                  {nac}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>
              {t("filter_by_position", "Filtrar por puesto")}
            </InputLabel>
            <Select
              name="puesto"
              value={filters.puesto}
              onChange={handleFilterChange}
              label={t("filter_by_position", "Filtrar por puesto")}
            >
              <MenuItem value="">
                <em>{t("all_positions", "Todos")}</em>
              </MenuItem>
              {PLAYER_POSITION_OPTIONS.map((position) => (
                <MenuItem key={position.value} value={position.value}>
                  {t(position.labelKey, position.fallback)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid
          item
          xs={12}
          md={2}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Button variant="outlined" onClick={clearFilters} fullWidth>
            {t("clear_filters", "Limpiar")}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              px: { xs: 1, sm: 2 },
              py: 1.5,
              border: "1px solid rgba(25, 38, 52, 0.12)",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              {t("filter_by_age_range", "Rango de edad")}: {ageRange[0]} -{" "}
              {ageRange[1]} {t("years_short", "años")}
            </Typography>
            <Slider
              value={ageRange}
              onChange={handleAgeRangeChange}
              valueLabelDisplay="auto"
              min={ageBounds[0]}
              max={ageBounds[1]}
              disabled={!hasAgeData}
              disableSwap
              marks={[
                { value: ageBounds[0], label: String(ageBounds[0]) },
                { value: ageBounds[1], label: String(ageBounds[1]) },
              ]}
            />
            {!hasAgeData && (
              <Typography variant="body2" color="text.secondary">
                {t(
                  "no_age_data_available",
                  "Todavía no hay perfiles con fecha de nacimiento cargada.",
                )}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* ===== RESULTADOS ===== */}
      {filteredProfiles.length === 0 ? (
        <Typography>{t("no_profiles_filters")}</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredProfiles.map((profile, index) => (
            <React.Fragment key={profile.id}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <ProfileCard profile={profile} />
              </Grid>
              {(index + 1) % 8 === 0 && (
                <Grid item xs={12}>
                  <AdBanner placement="profiles_inline" compact />
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Grid>
      )}
    </>
  );
}
