"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import LoadingSpinner from "@/components/LoadingSpinner";
import Alert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";

interface Offer {
  id: string;
  titulo: string;
  descripcion: string;
  ubicacion?: string;
  puesto?: string;
  nivel?: string;
}

const fetchOffers = async () => {
  const { data } = await apiClient.get("/offers");
  return data;
};

export default function OffersPage() {
  const router = useRouter();
  const { t } = useTranslation("common");

  const {
    data: offers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["offers"],
    queryFn: fetchOffers,
  });

  if (isLoading) {
    return <LoadingSpinner text={t("loading_offers", "Cargando ofertas...")} />;
  }

  if (error) {
    return (
      <Alert severity="error">
        {t("error_loading_offers", "Error al cargar las ofertas")}
      </Alert>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        {t("no_offers", "No hay ofertas publicadas todavía")}
      </Typography>
    );
  }

  console.log("Value of offers:", offers);
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t("offers_title", "Ofertas de Trabajo")}
      </Typography>

      <Stack spacing={2}>
        {offers.map((offer: Offer) => (
          <Card key={offer.id}>
            <CardContent>
              <Typography variant="h6">{offer.titulo}</Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {offer.descripcion.slice(0, 150)}...
              </Typography>

              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                {offer.ubicacion} {offer.nivel && `• ${offer.nivel}`}
              </Typography>

              <Button
                sx={{ mt: 2 }}
                variant="outlined"
                onClick={() => router.push(`/offers/${offer.id}`)}
              >
                {t("view_offer", "Ver oferta")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
