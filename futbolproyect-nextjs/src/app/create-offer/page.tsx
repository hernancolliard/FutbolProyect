"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { useAuth } from "@/context/AuthContext";
import CreateOffer from "@/components/CreateOffer";
import { useTranslation } from "react-i18next";

export default function CreateOfferPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation("common");
  const canPublishOffer =
    user?.tipo_usuario === "ofertante" || user?.isadmin === true;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 920, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(25, 38, 52, 0.12)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={2.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(245, 166, 35, 0.18)",
                  color: "primary.main",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <WorkOutlineIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
                {t(
                  "create_offer_guest_title",
                  "Para publicar una oferta necesitas una cuenta",
                )}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
                {t(
                  "create_offer_guest_text",
                  "Registrate como club, agencia o scout para publicar oportunidades y recibir postulaciones de profesionales del futbol.",
                )}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  component={Link}
                  href="/register?role=club"
                  variant="contained"
                  color="secondary"
                >
                  {t("create_offer_guest_register", "Registrarme para publicar")}
                </Button>
                <Button component={Link} href="/login" variant="outlined">
                  {t("create_offer_guest_login", "Ya tengo cuenta")}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!canPublishOffer) {
    return (
      <Box sx={{ maxWidth: 820, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Alert
          severity="info"
          action={
            <Button component={Link} href="/" color="inherit" size="small">
              {t("back_to_home", "Volver al inicio")}
            </Button>
          }
          sx={{ alignItems: "center" }}
        >
          {t(
            "create_offer_wrong_role",
            "La publicacion de ofertas esta disponible para cuentas de clubes, agencias o scouts.",
          )}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Crear oferta
      </Typography>

      <CreateOffer />
    </Box>
  );
}
