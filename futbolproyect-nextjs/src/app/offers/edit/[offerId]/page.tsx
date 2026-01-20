"use client";

import React from "react";
import CreateOffer from "@/components/CreateOffer";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

export default function EditOfferPage() {
  const { t } = useTranslation("common");
  const { user } = useAuth();

  // Protección básica de ruta: si no hay usuario, mostrar aviso
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Stack spacing={2}>
          <Alert severity="warning">
            {t(
              "must_be_logged_in",
              "Debes iniciar sesión para editar una oferta.",
            )}
          </Alert>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 4, textAlign: "center", fontWeight: "bold" }}
      >
        {t("edit_offer_title", "Editar Oferta")}
      </Typography>
      {/* CreateOffer detectará automáticamente el 'offerId' de la URL 
         gracias a que usa el hook useParams() internamente.
      */}
      <CreateOffer />
    </Container>
  );
}
