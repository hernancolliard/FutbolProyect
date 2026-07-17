"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Box,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const seoLinks = [
  {
    href: "/perfiles/jugadores",
    labelKey: "seo_link_player_profiles",
  },
  {
    href: "/all-offers",
    labelKey: "seo_link_football_opportunities",
  },
  {
    href: "/ofertas/entrenadores",
    labelKey: "coach_offers",
  },
  {
    href: "/ofertas/analistas-de-futbol",
    labelKey: "seo_link_analyst_jobs",
  },
  {
    href: "/perfiles",
    labelKey: "seo_link_find_players",
  },
  {
    href: "/create-offer",
    labelKey: "publish_offer",
  },
];

export default function HomeSeoOverview() {
  const { t } = useTranslation("common");

  return (
    <Box component="section" aria-labelledby="home-seo-overview-title">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          border: "1px solid #dfe6ef",
          borderRadius: 2.5,
          bgcolor: "#fff",
        }}
      >
        <Typography
          id="home-seo-overview-title"
          component="h2"
          sx={{
            color: "#0a1930",
            fontSize: { xs: "1.55rem", md: "1.9rem" },
            fontWeight: 900,
          }}
        >
          {t(
            "home_seo_overview_title",
            "Perfiles y oportunidades para profesionales del fútbol",
          )}
        </Typography>
        <Typography
          sx={{ mt: 1.2, maxWidth: 900, color: "#5e6c81", lineHeight: 1.7 }}
        >
          {t(
            "home_seo_overview_text_1",
            "En FutbolProyect, futbolistas, entrenadores, scouts y analistas de fútbol pueden crear un perfil deportivo con su trayectoria, fotos, videos y datos profesionales. La plataforma facilita conexiones con clubes, agencias y representantes que buscan talento para sus proyectos.",
          )}
        </Typography>
        <Typography
          sx={{ mt: 1, maxWidth: 900, color: "#5e6c81", lineHeight: 1.7 }}
        >
          {t(
            "home_seo_overview_text_2",
            "Explorá perfiles de jugadores, encontrá ofertas para profesionales del fútbol o publicá una oportunidad para llegar a candidatos con experiencia y material deportivo.",
          )}
        </Typography>
        <Stack
          component="nav"
          aria-label={t(
            "home_seo_links_aria",
            "Enlaces a perfiles y oportunidades de fútbol",
          )}
          direction="row"
          useFlexGap
          flexWrap="wrap"
          gap={1}
          sx={{ mt: 2.2 }}
        >
          {seoLinks.map((link) => (
            <MuiLink
              key={link.href}
              component={Link}
              href={link.href}
              underline="none"
              sx={{
                px: 1.4,
                py: 0.8,
                border: "1px solid #cbd9eb",
                borderRadius: 1.5,
                color: "#1557ad",
                fontSize: ".86rem",
                fontWeight: 800,
                "&:hover": {
                  borderColor: "#1262db",
                  bgcolor: "#edf5ff",
                },
              }}
            >
              {t(link.labelKey)}
            </MuiLink>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
