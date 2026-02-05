"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
export const dynamic = 'force-dynamic';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { getApiBaseUrl } from "@/lib/api";

interface Offer {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion?: string;
  nivel?: string;
}

export default function OffersPage() {
  const { t } = useTranslation("common");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const apiUrl = getApiBaseUrl();
        const res = await fetch(`${apiUrl}/offers`);

        if (!res.ok) throw new Error("Error fetching offers");

        const data = await res.json();
        setOffers(Array.isArray(data) ? data : []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
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
                {offer.descripcion.slice(0, 150)}…
              </Typography>

              <Button
                sx={{ mt: 2 }}
                variant="outlined"
                component={Link}
                href={`/offers/${offer.id}`}
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
