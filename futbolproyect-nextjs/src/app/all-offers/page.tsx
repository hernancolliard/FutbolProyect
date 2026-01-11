'use client';

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient"; // Centralized apiClient
import OfferList from "../../components/OfferList"; // Migrated OfferList
import Pagination from "../../components/Pagination"; // Migrated Pagination
import { useTranslation } from "react-i18next";
// import { Helmet } from "react-helmet-async"; // Replaced by Next.js metadata
import LoadingSpinner from "../../components/LoadingSpinner"; // Migrated LoadingSpinner
import useIsMobile from "../../hooks/useIsMobile"; // Migrated useIsMobile
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Button, Grid, Collapse } from "@mui/material"; // Material UI components

// --- Lógica de Fetching para React Query ---
const fetchOffers = async ({ queryKey }) => {
  const [, filters, page] = queryKey;
  const params = new URLSearchParams({
    page: page,
    limit: 10,
    ...filters, // Añadimos todos los filtros directamente
  });

  // Limpiamos parámetros vacíos para una URL más limpia
  for (const [key, value] of params.entries()) {
    if (!value) {
      params.delete(key);
    }
  }

  const { data } = await apiClient.get(`/offers?${params.toString()}`);
  return data;
};

// SEO Metadata for the page (static part for server components)
// For client components, dynamic metadata is set in useEffect
export const metadata = {
  title: "Buscar Ofertas de Empleo en Fútbol | FutbolProyect",
  description: "Explora todas las ofertas de empleo para futbolistas, entrenadores, ojeadores y staff. Usa nuestros filtros para encontrar tu próximo club o rol en la industria del fútbol en FutbolProyect.",
};

// --- Componente Principal de la Página de Ofertas ---
export default function AllOffersPage() {
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    puesto: "",
    ubicacion: "",
    nivel: "",
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["offers", debouncedFilters, currentPage],
    queryFn: fetchOffers,
    keepPreviousData: true,
  });

  // Dynamic SEO update for client components
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t("all_offers_seo_title", "Buscar Ofertas de Empleo en Fútbol | FutbolProyect");
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', t("all_offers_seo_desc", "Explora todas las ofertas de empleo para futbolistas, entrenadores, ojeadores y staff. Usa nuestros filtros para encontrar tu próximo club o rol en la industria del fútbol en FutbolProyect."));
      } else {
        const newMetaTag = document.createElement('meta');
        newMetaTag.name = 'description';
        newMetaTag.content = t("all_offers_seo_desc", "Explora todas las ofertas de empleo para futbolistas, entrenadores, ojeadores y staff. Usa nuestros filtros para encontrar tu próximo club o rol en la industria del fútbol en FutbolProyect.");
        document.head.appendChild(newMetaTag);
      }
    }
  }, [t]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
        {t("all_offers_title", "Todas las Ofertas de Empleo")}
      </Typography>

      {isMobile && (
        <Button
          variant="contained"
          onClick={toggleMobileFilters}
          sx={{ mb: 2 }}
        >
          {showMobileFilters ? t("hide_filters", "Ocultar Filtros") : t("show_filters", "Mostrar Filtros")}
        </Button>
      )}

      <Collapse in={!isMobile || showMobileFilters}>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              name="puesto"
              label={t("filter_by_position", "Filtrar por puesto")}
              value={filters.puesto}
              onChange={handleFilterChange}
              sx={{
                '& .MuiInputBase-root': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              name="ubicacion"
              label={t("filter_by_location", "Filtrar por ubicación")}
              value={filters.ubicacion}
              onChange={handleFilterChange}
              sx={{
                '& .MuiInputBase-root': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'white' }}>{t("filter_by_level", "Nivel")}</InputLabel>
              <Select
                name="nivel"
                value={filters.nivel}
                onChange={handleFilterChange}
                label={t("filter_by_level", "Nivel")}
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '.MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
              >
                <MenuItem value="">{t("select_level", "Seleccionar Nivel")}</MenuItem>
                <MenuItem value="Profesional">{t("level_professional", "Profesional")}</MenuItem>
                <MenuItem value="Semi-Profesional">{t("level_semi_professional", "Semi-Profesional")}</MenuItem>
                <MenuItem value="Amateur">{t("level_amateur", "Amateur")}</MenuItem>
                <MenuItem value="Otro">{t("level_other", "Otro")}</MenuItem>
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
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputBase-root': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="number"
              name="salarioMax"
              label={t("filter_by_max_salary", "Salario Máx.")}
              value={filters.salarioMax}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputBase-root': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'white' }}>{t("sort_by", "Ordenar por")}</InputLabel>
              <Select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                label={t("sort_by", "Ordenar por")}
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '.MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
              >
                <MenuItem value="desc">{t("sort_by_recent", "Más recientes")}</MenuItem>
                <MenuItem value="asc">{t("sort_by_oldest", "Más antiguos")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Collapse>

      {isLoading ? (
        <LoadingSpinner text={t("loading_offers", "Cargando ofertas...")} />
      ) : isError ? (
        <Typography color="error" sx={{ mt: 2 }}>
          {t("error_loading_offers", "Error al cargar ofertas")}: {error.message}
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