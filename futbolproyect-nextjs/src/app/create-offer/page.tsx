"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useAuth } from "@/context/AuthContext";
import CreateOffer from "@/components/CreateOffer";
import { useTranslation } from "react-i18next";
import { hasCompatibleActiveSubscription } from "@/lib/subscriptionAccess";

const pageBackground = {
  bgcolor: "#f7f9fc",
  minHeight: "100vh",
  pb: { xs: 7, md: 10 },
};

const heroBackground =
  "linear-gradient(90deg, rgba(2, 15, 37, .97), rgba(3, 31, 70, .88)), url('/images/estadio-futbol.webp')";

export default function CreateOfferPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation("common");
  const canPublishOffer =
    user?.tipo_usuario === "ofertante" || user?.isadmin === true;
  const canUseOfferManagement =
    user?.isadmin === true || hasCompatibleActiveSubscription(user);

  if (loading) {
    return (
      <Box sx={{ ...pageBackground, display: "grid", placeItems: "center" }}>
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress />
          <Typography sx={{ color: "#65738a" }}>
            {t("create_offer_preparing_form")}
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={pageBackground}>
        <Box
          component="section"
          sx={{
            py: { xs: 5, md: 7 },
            color: "#fff",
            backgroundImage: heroBackground,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Container maxWidth="lg">
            <Typography
              component="h1"
              sx={{
                maxWidth: 760,
                color: "#fff",
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
                fontWeight: 900,
              }}
            >
              {t("create_offer_hero_title")}
            </Typography>
            <Typography
              sx={{ mt: 1.5, maxWidth: 650, color: "rgba(255,255,255,.76)", lineHeight: 1.7 }}
            >
              {t("create_offer_hero_text")}
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ mt: { xs: 3, md: -3 }, position: "relative" }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4 },
              border: "1px solid #dfe6ef",
              borderRadius: 3,
              boxShadow: "0 18px 45px rgba(8, 34, 70, .1)",
            }}
          >
            <Stack spacing={2.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: 2,
                  bgcolor: "#edf5ff",
                  color: "#1262db",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <WorkOutlineRoundedIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography component="h2" sx={{ color: "#0a1930", fontSize: "1.5rem", fontWeight: 900 }}>
                {t(
                  "create_offer_guest_title",
                  "Para publicar una oferta necesitás una cuenta",
                )}
              </Typography>
              <Typography sx={{ maxWidth: 680, color: "#65738a", lineHeight: 1.7 }}>
                {t(
                  "create_offer_guest_text",
                  "Creá una cuenta de organización para publicar oportunidades, gestionar candidatos y contactar profesionales.",
                )}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  component={Link}
                  href="/register?role=club"
                  variant="contained"
                  sx={{ bgcolor: "#1262db", fontWeight: 900 }}
                >
                  {t("create_offer_guest_register", "Registrarme para publicar")}
                </Button>
                <Button component={Link} href="/login" variant="outlined" sx={{ fontWeight: 800 }}>
                  {t("create_offer_guest_login", "Ya tengo cuenta")}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!canPublishOffer) {
    return (
      <Box sx={pageBackground}>
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
          <Paper
            elevation={0}
            sx={{ p: { xs: 2.5, md: 4 }, border: "1px solid #dfe6ef", borderRadius: 3 }}
          >
            <Stack spacing={2.5} alignItems="flex-start">
              <CheckCircleOutlineRoundedIcon sx={{ color: "#1262db", fontSize: 42 }} />
              <Typography component="h1" sx={{ color: "#0a1930", fontSize: "1.7rem", fontWeight: 900 }}>
                {t("create_offer_role_title")}
              </Typography>
              <Alert severity="info" sx={{ width: "100%" }}>
                {t(
                  "create_offer_wrong_role",
                  "La publicación de ofertas está disponible para cuentas de clubes, agencias o scouts.",
                )}
              </Alert>
              <Button component={Link} href="/" variant="outlined">
                {t("back_to_home", "Volver al inicio")}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!canUseOfferManagement) {
    return (
      <Box sx={pageBackground}>
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
          <Paper
            elevation={0}
            sx={{ p: { xs: 2.5, md: 4 }, border: "1px solid #dfe6ef", borderRadius: 3 }}
          >
            <Stack spacing={2.5} alignItems="flex-start">
              <WorkOutlineRoundedIcon sx={{ color: "#1262db", fontSize: 42 }} />
              <Typography component="h1" sx={{ color: "#0a1930", fontSize: "1.7rem", fontWeight: 900 }}>
                {t("offer_subscription_gate_title")}
              </Typography>
              <Alert severity="info" sx={{ width: "100%" }}>
                {t("offer_management_subscription_gate_description")}
              </Alert>
              <Button component={Link} href="/suscripcion" variant="contained">
                {t("view_subscription_plans")}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={pageBackground}>
      <Box
        component="section"
        sx={{
          py: { xs: 5, md: 6.5 },
          color: "#fff",
          backgroundImage: heroBackground,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={3}>
            <Box>
              <Typography
                component="h1"
                sx={{
                  color: "#fff",
                  fontSize: { xs: "2rem", md: "3rem" },
                  lineHeight: 1.08,
                  letterSpacing: "-0.035em",
                  fontWeight: 900,
                }}
              >
                {t("create_offer_page_title")}
              </Typography>
              <Typography sx={{ mt: 1.3, maxWidth: 650, color: "rgba(255,255,255,.76)", lineHeight: 1.7 }}>
                {t("create_offer_page_text")}
              </Typography>
            </Box>
            <Stack spacing={1} sx={{ minWidth: { md: 270 } }}>
              {[
                t("create_offer_tip_description"),
                t("create_offer_tip_location"),
                t("create_offer_tip_image"),
              ].map((item) => (
                <Stack key={item} direction="row" spacing={1} alignItems="center">
                  <CheckCircleOutlineRoundedIcon sx={{ color: "#62a8ff", fontSize: 19 }} />
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,.82)" }}>
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: 3, md: -3 }, position: "relative" }}>
        <CreateOffer />
      </Container>
    </Box>
  );
}
