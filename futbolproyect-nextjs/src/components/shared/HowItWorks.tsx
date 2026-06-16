"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ConnectWithoutContactOutlinedIcon from "@mui/icons-material/ConnectWithoutContactOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import { useAuth } from "@/context/AuthContext";

const steps = [
  {
    icon: <HowToRegOutlinedIcon />,
    titleKey: "how_it_works_step_1_title",
    textKey: "how_it_works_step_1_text",
    fallbackTitle: "Crea tu perfil o publica una oferta",
    fallbackText:
      "Jugadores y profesionales muestran su trayectoria. Clubes, agencias y academias publican necesidades concretas.",
  },
  {
    icon: <AssignmentTurnedInOutlinedIcon />,
    titleKey: "how_it_works_step_2_title",
    textKey: "how_it_works_step_2_text",
    fallbackTitle: "Muestra informacion relevante",
    fallbackText:
      "Agrega datos deportivos, experiencia, videos, fotos, informes y detalles de la oportunidad para filtrar mejor.",
  },
  {
    icon: <ConnectWithoutContactOutlinedIcon />,
    titleKey: "how_it_works_step_3_title",
    textKey: "how_it_works_step_3_text",
    fallbackTitle: "Conecta y avanza",
    fallbackText:
      "Postulaciones, perfiles y contacto directo ayudan a pasar de la busqueda a una conversacion real.",
  },
];

function HowItWorks() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canPublishOffer =
    user?.tipo_usuario === "ofertante" || user?.isadmin === true;

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 3 },
        background: "linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(25, 38, 52, 0.12)",
          background:
            "linear-gradient(135deg, rgba(25, 38, 52, 0.98), rgba(25, 38, 52, 0.88))",
          color: "white",
          p: { xs: 2.5, md: 4 },
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: { xs: -70, md: -30 },
            top: { xs: -70, md: -40 },
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(245, 166, 35, 0.18)",
          }}
        />

        <Stack spacing={1.5} sx={{ position: "relative", mb: 3 }}>
          <Chip
            icon={<EmojiEventsOutlinedIcon />}
            label={t("how_it_works_badge", "Proceso simple")}
            color="secondary"
            sx={{
              width: "fit-content",
              fontWeight: 700,
              bgcolor: "rgba(245, 166, 35, 0.16)",
              color: "secondary.main",
              "& .MuiChip-icon": { color: "secondary.main" },
            }}
          />
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: "white",
              fontWeight: 900,
              fontSize: { xs: "2rem", md: "2.7rem" },
              maxWidth: 760,
            }}
          >
            {t("how_it_works_title", "Como funciona FutbolProyect")}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.78)",
              maxWidth: 760,
              fontSize: { xs: "1rem", md: "1.12rem" },
            }}
          >
            {t(
              "how_it_works_subtitle",
              "Una forma clara de ordenar oportunidades, perfiles y contactos dentro del mercado laboral del futbol.",
            )}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            position: "relative",
          }}
        >
          {steps.map((step, index) => (
            <Card
              key={step.titleKey}
              elevation={0}
              sx={{
                height: "100%",
                bgcolor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "secondary.main",
                      color: "primary.main",
                      fontWeight: 900,
                      "& svg": { fontSize: 28 },
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography sx={{ color: "secondary.main", fontWeight: 900 }}>
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 800 }}>
                    {t(step.titleKey, step.fallbackTitle)}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.76)" }}>
                    {t(step.textKey, step.fallbackText)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ position: "relative", mt: 3 }}
        >
          <Button
            component={Link}
            href="/register"
            variant="contained"
            color="secondary"
          >
            {t("how_it_works_primary_cta", "Crear mi perfil")}
          </Button>
          <Button
            component={Link}
            href={canPublishOffer ? "/create-offer" : "/register?role=club"}
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.55)",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.08)",
              },
            }}
          >
            {t("how_it_works_secondary_cta", "Publicar una oferta")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default HowItWorks;
