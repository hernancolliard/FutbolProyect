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
  fecha_creacion: string;
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
  console.log('fetchUserOffers llamado con userId:', userId);
  const response = await apiClient.get("/offers/my-offers");
  console.log('Respuesta de /offers/my-offers:', response.data);
  return response.data;
};

export default function MyOffersSection({
  userId,
}: MyOffersSectionProps) {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('MyOffersSection renderizado con userId:', userId);

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
    <Stack sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t("my_offers_title", "Mis Ofertas Publicadas")}
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : offers.length > 0 ? (
        <Stack spacing={2}>
          {offers.map((offer) => (
            <Card key={offer.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <div>
                  <Typography variant="h6">{offer.titulo}</Typography>
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
                    {t("created", "Creada")}: {new Date(offer.fecha_creacion).toLocaleDateString()}
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={offer.estado === 'abierta' ? t('open', 'Abierta') : t('closed', 'Cerrada')}
                    color={offer.estado === 'abierta' ? 'success' : 'default'}
                    size="small"
                  />
                  {offer.is_featured && (
                    <Chip
                      label={t('featured', 'Destacada')}
                      color="primary"
                      size="small"
                    />
                  )}
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
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