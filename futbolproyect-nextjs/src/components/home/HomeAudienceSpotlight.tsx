"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Paper, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useTranslation } from "react-i18next";

const audiences = [
  {
    titleKey: "home_audience_players_title",
    textKey: "home_audience_players_text",
    image: "/images/jugadores-staff.png",
    href: "/register",
    actionKey: "how_it_works_primary_cta",
  },
  {
    titleKey: "use_case_clubs_title",
    textKey: "home_audience_clubs_text",
    image: "/images/clubes-agencias.png",
    href: "/create-offer",
    actionKey: "publish_offer",
  },
  {
    titleKey: "use_case_scouts_title",
    textKey: "home_audience_scouts_text",
    image: "/images/scouts-reclutadores.png",
    href: "/perfiles",
    actionKey: "home_search_profiles",
  },
];

export default function HomeAudienceSpotlight() {
  const { t } = useTranslation("common");
  return (
    <Box
      component="section"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: 2,
      }}
    >
      {audiences.map((audience) => (
        <Paper
          key={audience.titleKey}
          elevation={0}
          sx={{
            p: 1.5,
            border: "1px solid #dfe6ef",
            borderRadius: 2.5,
            overflow: "hidden",
          }}
        >
          <Typography sx={{ mb: 1, color: "#0a1930", fontWeight: 900 }}>
            {t(audience.titleKey)}
          </Typography>
          <Box sx={{ position: "relative", height: 155, borderRadius: 1.7, overflow: "hidden" }}>
            <Image
              src={audience.image}
              alt={t(audience.titleKey)}
              fill
              sizes="(max-width: 900px) 100vw, 33vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, transparent, rgba(3, 17, 38, .38))",
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ mt: 1.3, color: "#5e6c81", lineHeight: 1.55 }}>
            {t(audience.textKey)}
          </Typography>
          <Button
            component={Link}
            href={audience.href}
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ mt: 1, px: 0, fontWeight: 900 }}
          >
            {t(audience.actionKey)}
          </Button>
        </Paper>
      ))}
    </Box>
  );
}
