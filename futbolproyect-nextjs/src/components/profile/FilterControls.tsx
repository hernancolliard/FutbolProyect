"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Profile } from "@/lib/types";
import ProfileCard from "@/components/profile/ProfileCard";

interface FilterControlsProps {
  nacionalidades: string[];
  puestos: string[];
  initialProfiles: Profile[];
}

export default function FilterControls({
  nacionalidades,
  puestos,
  initialProfiles,
}: FilterControlsProps) {
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    nacionalidad: "",
    puesto: "",
  });

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({ nacionalidad: "", puesto: "" });
  };

  const filteredProfiles = useMemo(() => {
    return initialProfiles.filter((profile) => {
      const matchNac =
        !filters.nacionalidad || profile.nacionalidad === filters.nacionalidad;

      const matchPuesto =
        !filters.puesto || profile.posicion_principal === filters.puesto;

      return matchNac && matchPuesto;
    });
  }, [filters, initialProfiles]);

  return (
    <>
      {/* ===== FILTROS ===== */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={5}>
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

        <Grid item xs={12} sm={5}>
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
              {puestos.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid
          item
          xs={12}
          sm={2}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Button variant="outlined" onClick={clearFilters} fullWidth>
            {t("clear_filters", "Limpiar")}
          </Button>
        </Grid>
      </Grid>

      {/* ===== RESULTADOS ===== */}
      {filteredProfiles.length === 0 ? (
        <Typography>{t("no_profiles_filters")}</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredProfiles.map((profile) => (
            <Grid item key={profile.id} xs={12} sm={6} md={4} lg={3}>
              <ProfileCard profile={profile} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
