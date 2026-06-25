"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";

const signals = [
  {
    valueKey: "trust_signal_profiles_value",
    labelKey: "trust_signal_profiles_label",
    fallbackValue: "Perfiles completos",
    fallbackLabel: "CV, videos, fotos, datos deportivos e informes en un solo lugar.",
  },
  {
    valueKey: "trust_signal_jobs_value",
    labelKey: "trust_signal_jobs_label",
    fallbackValue: "Ofertas enfocadas",
    fallbackLabel: "Publicaciones pensadas para roles reales dentro del futbol.",
  },
  {
    valueKey: "trust_signal_contact_value",
    labelKey: "trust_signal_contact_label",
    fallbackValue: "Contacto directo",
    fallbackLabel: "Menos friccion entre quien busca talento y quien busca oportunidad.",
  },
  {
    valueKey: "trust_signal_market_value",
    labelKey: "trust_signal_market_label",
    fallbackValue: "Mercado global",
    fallbackLabel: "Una plataforma preparada para perfiles, clubes y agencias de distintos paises.",
  },
];

const useCases = [
  {
    icon: <SportsSoccerOutlinedIcon />,
    titleKey: "use_case_clubs_title",
    textKey: "use_case_clubs_text",
    fallbackTitle: "Para clubes y agencias",
    fallbackText:
      "Publicar oportunidades, recibir postulaciones y revisar candidatos con informacion ordenada.",
  },
  {
    icon: <VideoLibraryOutlinedIcon />,
    titleKey: "use_case_players_title",
    textKey: "use_case_players_text",
    fallbackTitle: "Para jugadores y staff",
    fallbackText:
      "Mostrar trayectoria, material deportivo y objetivos para aumentar visibilidad profesional.",
  },
  {
    icon: <SpeedOutlinedIcon />,
    titleKey: "use_case_scouts_title",
    textKey: "use_case_scouts_text",
    fallbackTitle: "Para scouts y reclutadores",
    fallbackText:
      "Encontrar perfiles con filtros y datos utiles antes de iniciar una conversacion.",
  },
];

function HomeTrustSignals() {
  const { t } = useTranslation("common");

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        py: { xs: 5, md: 7 },
        px: { xs: 2, md: 3 },
        bgcolor: "#f8fafc",
      }}
    >
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        <Stack spacing={1.5} sx={{ mb: 3, alignItems: { xs: 'center', md: 'flex-start' } }}>
          <Chip
            icon={<CheckCircleOutlineIcon />}
            label={t("trust_signals_badge", "Mas confianza desde el primer clic")}
            color="secondary"
            variant="outlined"
          />
          <Typography variant="h4" component="h2" sx={{ fontWeight: 900, textAlign: { xs: 'center', md: 'left' } }}>
            {t("trust_signals_title", "Una pagina mas clara para decidir rapido")}
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760, textAlign: { xs: 'center', md: 'left' } }}>
            {t(
              "trust_signals_subtitle",
              "La home ahora explica el valor de la plataforma, orienta cada tipo de usuario y reduce dudas antes del registro.",
            )}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          {signals.map((signal) => (
            <Card
              key={signal.valueKey}
              elevation={0}
              sx={{
                border: "1px solid rgba(25, 38, 52, 0.12)",
                bgcolor: "background.paper",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "primary.main", mb: 1 }}>
                  {t(signal.valueKey, signal.fallbackValue)}
                </Typography>
                <Typography color="text.secondary">
                  {t(signal.labelKey, signal.fallbackLabel)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {useCases.map((item) => (
            <Card
              key={item.titleKey}
              elevation={0}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid rgba(25, 38, 52, 0.12)",
                height: "100%",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(245, 166, 35, 0.18)",
                      color: "primary.main",
                      "& svg": { fontSize: 28 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {t(item.titleKey, item.fallbackTitle)}
                  </Typography>
                  <Typography color="text.secondary">
                    {t(item.textKey, item.fallbackText)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 3 }}>
          <PublicOutlinedIcon color="primary" />
          <Typography color="text.secondary" sx={{ textAlign: "center", fontWeight: 700 }}>
            {t(
              "trust_signals_footer",
              "Pensado para conectar talento y oportunidades en el ecosistema del futbol.",
            )}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default HomeTrustSignals;
