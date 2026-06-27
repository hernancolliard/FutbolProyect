"use client";

import React, { useState } from "react";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Collapse,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import apiClient from "@/lib/apiClient";
import OfferList from "@/components/shared/OfferList";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdBanner from "@/components/ads/AdBanner";
import OffersHero from "@/components/offers/OffersHero";
import OfferFiltersSidebar, {
  OfferFilters,
} from "@/components/offers/OfferFiltersSidebar";
import { Offer } from "@/lib/types";

type OffersResponse = {
  offers: Offer[];
  totalPages: number;
  currentPage: number;
  totalOffers: number;
};

type FilterOptions = {
  puestos: string[];
  ubicaciones: string[];
  niveles: string[];
  horarios: string[];
};

const emptyFilters: OfferFilters = {
  puesto: "",
  ubicacion: "",
  nivel: "",
  horarios: "",
  salarioMin: "",
  salarioMax: "",
  sort: "desc",
};

const fetchOffers = async ({
  queryKey,
}: QueryFunctionContext<[string, OfferFilters, number]>) => {
  const [, filters, page] = queryKey;
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
    show: "all",
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const { data } = await apiClient.get<OffersResponse>(
    `/offers?${params.toString()}`,
  );
  return data;
};

const fetchOfferFilterOptions = async () => {
  const { data } = await apiClient.get<FilterOptions>("/offers/filter-options");
  return data;
};

export default function AllOffersClient() {
  const [draftFilters, setDraftFilters] = useState<OfferFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<OfferFilters>(emptyFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data, isLoading, isError, error } = useQuery<OffersResponse, Error>({
    queryKey: ["offers", appliedFilters, currentPage],
    queryFn: fetchOffers,
    placeholderData: (previousData) => previousData,
  });

  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ["offerFilterOptions"],
    queryFn: fetchOfferFilterOptions,
  });

  const options = filterOptions || {
    puestos: [],
    ubicaciones: [],
    niveles: [],
    horarios: [],
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  const handleRoleChange = (puesto: string) => {
    const next = { ...draftFilters, puesto };
    setDraftFilters(next);
    setAppliedFilters(next);
    setCurrentPage(1);
  };

  const metrics = [
    { value: data?.totalOffers ?? "—", label: "Ofertas activas" },
    { value: options.ubicaciones.length || "—", label: "Ubicaciones" },
    { value: options.puestos.length || "—", label: "Puestos disponibles" },
    { value: options.horarios.length || "—", label: "Tipos de jornada" },
  ];

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh", pb: { xs: 7, md: 10 } }}>
      <OffersHero
        activeRole={draftFilters.puesto}
        metrics={metrics}
        onRoleChange={handleRoleChange}
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 11 } }}>
        <AdBanner placement="offers_top" />

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
            <Box sx={{ mb: 3 }}>
              <OfferFiltersSidebar
                filters={draftFilters}
                ubicaciones={options.ubicaciones}
                niveles={options.niveles}
                horarios={options.horarios}
                onChange={setDraftFilters}
                onApply={applyFilters}
                onClear={clearFilters}
              />
            </Box>
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
            <OfferFiltersSidebar
              filters={draftFilters}
              ubicaciones={options.ubicaciones}
              niveles={options.niveles}
              horarios={options.horarios}
              onChange={setDraftFilters}
              onApply={applyFilters}
              onClear={clearFilters}
            />
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
                {data?.totalOffers
                  ? `Mostrando ${Math.min((currentPage - 1) * 10 + 1, data.totalOffers)}–${Math.min(currentPage * 10, data.totalOffers)} de ${data.totalOffers} ofertas`
                  : "Ofertas disponibles"}
              </Typography>
              <Typography sx={{ color: "#0a1930", fontWeight: 800, fontSize: ".9rem" }}>
                {appliedFilters.sort === "asc" ? "Más antiguas" : "Más recientes"}
              </Typography>
            </Stack>

            {isLoading ? (
              <LoadingSpinner text="Cargando ofertas..." />
            ) : isError ? (
              <Typography color="error" sx={{ py: 4 }}>
                Error al cargar ofertas: {error.message}
              </Typography>
            ) : data?.offers.length ? (
              <>
                <OfferList offers={data.offers} showApplyButton={false} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.totalPages || 0}
                  onPageChange={(page: number) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 480, behavior: "smooth" });
                  }}
                />
              </>
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
                  No encontramos ofertas con estos filtros
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
