"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import "../../styles/TrustedBy.css";

const audiences = [
  {
    icon: <SearchIcon />,
    titleKey: "audience_talent_title",
    title: "Busco una oportunidad",
    textKey: "audience_talent_text",
    text: "Encuentra ofertas por puesto, pais, nivel y salario.",
    href: "/all-offers",
    ctaKey: "view_all_offers",
    cta: "Ver ofertas",
  },
  {
    icon: <GroupsIcon />,
    titleKey: "audience_club_title",
    title: "Busco talento",
    textKey: "audience_club_text",
    text: "Explora perfiles con CV, videos, datos deportivos y contacto directo.",
    href: "/perfiles",
    ctaKey: "view_all_profiles",
    cta: "Ver perfiles",
  },
  {
    icon: <WorkOutlineIcon />,
    titleKey: "audience_publish_title",
    title: "Publicar una oferta",
    textKey: "audience_publish_text",
    text: "Llega a jugadores, entrenadores, analistas, scouts y staff tecnico.",
    href: "/create-offer",
    ctaKey: "publish_offer",
    cta: "Publicar oferta",
  },
];

function TrustedBy() {
  const { t } = useTranslation();

  return (
    <Box className="trust-section">
      <Stack spacing={1.5} sx={{ mb: 3, maxWidth: 1180, mx: 'auto', alignItems: { xs: 'center', md: 'flex-start' } }}>
        <Chip
          icon={<VerifiedOutlinedIcon />}
          label={t("trust_badge", "Perfiles, ofertas y contacto en un solo lugar")}
          color="primary"
          variant="outlined"
        />
        <Typography variant="h4" component="h2" sx={{ fontWeight: 800, textAlign: { xs: 'center', md: 'left' } }}>
          {t("trust_title", "Una plataforma pensada para el mercado laboral del futbol")}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 760, textAlign: { xs: 'center', md: 'left' } }}>
          {t(
            "trust_subtitle",
            "Separa candidatos, clubes y agencias desde el primer clic para que cada usuario llegue rapido al flujo correcto.",
          )}
        </Typography>
      </Stack>

      <Box className="audience-grid">
        {audiences.map((item) => (
          <Paper key={item.titleKey} className="audience-card" elevation={0}>
            <Box className="audience-icon">{item.icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t(item.titleKey, item.title)}
            </Typography>
            <Typography color="text.secondary">
              {t(item.textKey, item.text)}
            </Typography>
            <Button component={Link} href={item.href} variant="outlined">
              {t(item.ctaKey, item.cta)}
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default TrustedBy;
