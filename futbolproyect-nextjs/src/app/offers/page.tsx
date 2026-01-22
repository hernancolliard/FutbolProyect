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
import Alert from "@mui/material/Alert";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";

interface Offer {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion?: string;
  nivel?: string;
}

const fetchOffers = async (): Promise<Offer[]> => {
  const { data } = await apiClient.get("/offers");
  return Array.isArray(data) ? data : [];
};

export default function OffersPage() {
  const router = useRouter();
  const { t } = useTranslation("common");

  const {
    data: offers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["offers"],
    queryFn: fetchOffers,
  });

  if (isLoading) {
    return <LoadingSpinner text={t("loading_offers")} />;
  }

  if (error) {
    return <Alert severity="error">{t("error_loading_offers")}</Alert>;
  }

  if (offers.length === 0) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        {t("no_offers")}
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t("offers_title")}
      </Typography>

      <Stack spacing={2}>
        {offers.map((offer) => (
          <Card key={offer.id}>
            <CardContent>
              <Typography variant="h6">{offer.titulo}</Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {offer.descripcion.slice(0, 150)}...
              </Typography>

              <Button
                sx={{ mt: 2 }}
                variant="outlined"
                onClick={() => router.push(`/offers/${offer.id}`)}
              >
                {t("view_offer")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
