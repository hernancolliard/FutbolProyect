"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Card,
  Button,
  Chip,
  Grid,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import apiClient from "@/lib/apiClient";

interface Offer {
  id: number;
  titulo: string;
  descripcion: string;
  puesto: string;
  ubicacion: string;
  salario: string;
  horarios: string;
  nivel: string;
  fecha_publicacion: string;
  featured_until?: string;
  estado: string;
  is_featured: boolean;
  total_applications: number;
}

interface MyOffersSectionProps {
  userId: string | number;
}

const fetchUserOffers = async (
  userId: string | number,
): Promise<Offer[]> => {
  const response = await apiClient.get("/offers/my-offers");
  return response.data;
};

export default function MyOffersSection({
  userId,
}: MyOffersSectionProps) {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const totalApplications = offers.reduce(
    (total, offer) => total + Number(offer.total_applications || 0),
    0,
  );
  const activeOffers = offers.filter((offer) => offer.estado === "abierta").length;

  useEffect(() => {
    const loadOffers = async () => {
      setIsLoading(true);
      try {
        const data = await fetchUserOffers(userId);
        setOffers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadOffers();
  }, [userId]);

  return (
    <Stack sx={{ mt: 4, minWidth: 0, maxWidth: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t("my_offers_title", "Mis Ofertas Publicadas")}
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : offers.length > 0 ? (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h5">{offers.length}</Typography>
                <Typography color="text.secondary">
                  {t("offers_published_metric", "Ofertas publicadas")}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h5">{totalApplications}</Typography>
                <Typography color="text.secondary">
                  {t("applications_received_metric", "Postulaciones recibidas")}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h5">{activeOffers}</Typography>
                <Typography color="text.secondary">
                  {t("active_offers_metric", "Ofertas abiertas")}
                </Typography>
              </Card>
            </Grid>
          </Grid>
          {offers.map((offer) => (
            <Card key={offer.id} variant="outlined" sx={{ p: 2, minWidth: 0 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "flex-start" }}
                gap={1.5}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ overflowWrap: "anywhere" }}>
                    {offer.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {offer.puesto} • {offer.ubicacion}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t("salary", "Salario")}:</strong> {offer.salario}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t("level", "Nivel")}:</strong> {offer.nivel}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t("applications", "Postulaciones")}:</strong> {offer.total_applications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("created", "Creada")}: {offer.fecha_publicacion ? new Date(offer.fecha_publicacion).toLocaleDateString() : "-"}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Chip
                    label={offer.estado === 'abierta' ? t('open', 'Abierta') : t('closed', 'Cerrada')}
                    color={offer.estado === 'abierta' ? 'success' : 'default'}
                    size="small"
                  />
                  {offer.is_featured && (
                    <Chip
                      label={
                        offer.featured_until
                          ? `${t('featured', 'Destacada')} hasta ${new Date(offer.featured_until).toLocaleDateString()}`
                          : t('featured', 'Destacada')
                      }
                      color="primary"
                      size="small"
                    />
                  )}
                </Stack>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 2 }}
              >
                <Button
                  component={Link}
                  href={`/offers/${offer.id}`}
                  size="small"
                  variant="outlined"
                >
                  {t("view_offer", "Ver Oferta")}
                </Button>
                <Button
                  component={Link}
                  href={`/offers/edit/${offer.id}`}
                  size="small"
                  variant="contained"
                >
                  {t("edit_offer", "Editar Oferta")}
                </Button>
                <Button
                  component={Link}
                  href={`/offers/${offer.id}/applicants`}
                  size="small"
                  variant="outlined"
                >
                  {t("view_applicants", "Ver Postulantes")}
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : (
        <Typography>
          {t("no_offers_yet", "Aún no has publicado ofertas.")}
        </Typography>
      )}
    </Stack>
  );
}
