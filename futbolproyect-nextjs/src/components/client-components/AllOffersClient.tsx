"use client";

import React, { useState, useEffect } from "react";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import OfferList from "@/components/shared/OfferList";
import Pagination from "@/components/Pagination";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/LoadingSpinner";
import useIsMobile from "@/hooks/useIsMobile";
import AdBanner from "@/components/ads/AdBanner";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Collapse,
  SelectChangeEvent,
  Paper,
  Stack,
  Chip,
} from "@mui/material";

// --- Fetching Logic for React Query ---
const fetchOffers = async ({
  queryKey,
}: QueryFunctionContext<[string, object, number]>) => {
  const [, filters, page] = queryKey;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    show: "all",
    ...(filters as Record<string, string>),
  });

  // Clean empty params for a cleaner URL
  for (const [key, value] of params.entries()) {
    if (!value) {
      params.delete(key);
    }
  }

  const { data } = await apiClient.get(`/offers?${params.toString()}`);
  return data;
};

const fetchOfferFilterOptions = async () => {
  const { data } = await apiClient.get("/offers/filter-options");
  return data;
};

const roleFilters = [
  { label: "Jugador", value: "jugador" },
  { label: "Entrenador", value: "entrenador" },
  { label: "Analista", value: "analista" },
  { label: "Scout", value: "scout" },
  { label: "Preparador fisico", value: "preparador" },
];

// --- Main Component for All Offers Page ---
export default function AllOffersClient() {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    puesto: "",
    ubicacion: "",
    nivel: "",
    horarios: "",
    salarioMin: "",
    salarioMax: "",
    sort: "desc",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters]);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const { data, isLoading, isError, error } = useQuery<any, Error>({
    queryKey: ["offers", debouncedFilters, currentPage],
    queryFn: fetchOffers,
    placeholderData: (previousData) => previousData,
  });

  const { data: filterOptions } = useQuery({
    queryKey: ["offerFilterOptions"],
    queryFn: fetchOfferFilterOptions,
  });

  const puestos = filterOptions?.puestos || [];
  const ubicaciones = filterOptions?.ubicaciones || [];
  const niveles = filterOptions?.niveles || [];
  const horarios = filterOptions?.horarios || [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "1200px", mx: "auto" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "text.primary", fontWeight: "bold", mb: 2 }}
      >
        {t("all_offers_title", "Todas las Ofertas de Empleo")}
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 3 }}>
        {t(
          "all_offers_intro",
          "Encuentra oportunidades reales en clubes, academias y proyectos deportivos. Usa los filtros para reducir por rol, ubicacion, nivel y rango salarial.",
        )}
      </Typography>

      <AdBanner placement="offers_top" />

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
        {roleFilters.map((role) => (
          <Chip
            key={role.value}
            clickable
            color={filters.puesto === role.value ? "primary" : "default"}
            label={t(`role_filter_${role.value}`, role.label)}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                puesto: prev.puesto === role.value ? "" : role.value,
              }))
            }
          />
        ))}
      </Stack>

      {isMobile && (
        <Button
          variant="contained"
          onClick={toggleMobileFilters}
          sx={{ mb: 2 }}
        >
          {showMobileFilters
            ? t("hide_filters", "Ocultar Filtros")
            : t("show_filters", "Mostrar Filtros")}
        </Button>
      )}

      <Collapse in={!isMobile || showMobileFilters}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            border: "1px solid rgba(25, 38, 52, 0.12)",
            borderRadius: 2,
          }}
        >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t("filter_by_position", "Filtrar por puesto")}</InputLabel>
              <Select
                name="puesto"
                value={filters.puesto}
                onChange={handleSelectChange}
                label={t("filter_by_position", "Filtrar por puesto")}
              >
                <MenuItem value="">{t("all_positions", "Todos")}</MenuItem>
                {puestos.map((puesto: string) => (
                  <MenuItem key={puesto} value={puesto}>
                    {puesto}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t("filter_by_location", "Filtrar por ubicación")}</InputLabel>
              <Select
                name="ubicacion"
                value={filters.ubicacion}
                onChange={handleSelectChange}
                label={t("filter_by_location", "Filtrar por ubicación")}
              >
                <MenuItem value="">{t("all_locations", "Todas")}</MenuItem>
                {ubicaciones.map((ubicacion: string) => (
                  <MenuItem key={ubicacion} value={ubicacion}>
                    {ubicacion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t("filter_by_level", "Nivel")}</InputLabel>
              <Select
                name="nivel"
                value={filters.nivel}
                onChange={handleSelectChange}
                label={t("filter_by_level", "Nivel")}
              >
                <MenuItem value="">
                  {t("select_level", "Seleccionar Nivel")}
                </MenuItem>
                {niveles.map((nivel: string) => (
                  <MenuItem key={nivel} value={nivel}>
                    {nivel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t("filter_by_schedule", "Jornada")}</InputLabel>
              <Select
                name="horarios"
                value={filters.horarios}
                onChange={handleSelectChange}
                label={t("filter_by_schedule", "Jornada")}
              >
                <MenuItem value="">{t("all_schedules", "Todas")}</MenuItem>
                {horarios.map((horario: string) => (
                  <MenuItem key={horario} value={horario}>
                    {horario}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="number"
              name="salarioMin"
              label={t("filter_by_min_salary", "Salario Mín.")}
              value={filters.salarioMin}
              onChange={handleTextFieldChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="number"
              name="salarioMax"
              label={t("filter_by_max_salary", "Salario Máx.")}
              value={filters.salarioMax}
              onChange={handleTextFieldChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t("sort_by", "Ordenar por")}</InputLabel>
              <Select
                name="sort"
                value={filters.sort}
                onChange={handleSelectChange}
                label={t("sort_by", "Ordenar por")}
              >
                <MenuItem value="desc">
                  {t("sort_by_recent", "Más recientes")}
                </MenuItem>
                <MenuItem value="asc">
                  {t("sort_by_oldest", "Más antiguos")}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        </Paper>
      </Collapse>

      {isLoading ? (
        <LoadingSpinner text={t("loading_offers", "Cargando ofertas...")} />
      ) : isError ? (
        <Typography color="error" sx={{ mt: 2 }}>
          {t("error_loading_offers", "Error al cargar ofertas")}:{" "}
          {error.message}
        </Typography>
      ) : (
        <>
          <OfferList offers={data?.offers || []} showApplyButton={false} />
          <Pagination
            currentPage={currentPage}
            totalPages={data?.totalPages || 0}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Box>
  );
}
