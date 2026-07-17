"use client";

import React from "react";
import Link from "next/link";
import CreateOffer from "@/components/CreateOffer";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import LoadingSpinner from "@/components/LoadingSpinner";
import { hasCompatibleActiveSubscription } from "@/lib/subscriptionAccess";

export default function EditOfferPage() {
  const { t } = useTranslation("common");
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="loading" />;
  }

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

  const hasOfferManagementAccess = Boolean(
    user.isadmin ||
      (["ofertante", "agencia"].includes(user.tipo_usuario) &&
        hasCompatibleActiveSubscription(user)),
  );

  if (!hasOfferManagementAccess) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Stack spacing={2} alignItems="flex-start">
          <Alert severity="info">
            {t("offer_management_subscription_gate_description")}
          </Alert>
          <Button component={Link} href="/suscripcion" variant="contained">
            {t("view_subscription_plans")}
          </Button>
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
