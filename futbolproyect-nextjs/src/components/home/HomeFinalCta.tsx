"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function HomeFinalCta() {
  const { t } = useTranslation("common");
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        px: 2,
        py: { xs: 4, md: 5 },
        borderRadius: 2.5,
        textAlign: "center",
        color: "#fff",
        bgcolor: "#061831",
      }}
    >
      <Image
        src="/images/estadio-futbol.webp"
        alt={t("football_stadium_alt", "Estadio de fútbol durante un partido")}
        fill
        sizes="(max-width: 1200px) 100vw, 1150px"
        style={{ objectFit: "cover" }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(90deg, rgba(3, 18, 42, .97), rgba(5, 40, 83, .88))",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          component="h2"
          sx={{ color: "#fff", fontSize: { xs: "1.8rem", md: "2.35rem" }, fontWeight: 900 }}
        >
          {t("home_final_cta_title")}
        </Typography>
        <Typography sx={{ mt: 1, color: "rgba(255,255,255,.74)" }}>
          {t("home_final_cta_text")}
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
          spacing={1.2}
          sx={{ mt: 2.5 }}
        >
          <Button
            component={Link}
            href="/register"
            variant="contained"
            sx={{ bgcolor: "#1262db", fontWeight: 900 }}
          >
            {t("home_create_profile_free")}
          </Button>
          <Button
            component={Link}
            href="/all-offers"
            variant="outlined"
            sx={{ color: "#fff", borderColor: "rgba(255,255,255,.55)", fontWeight: 900 }}
          >
            {t("hero_primary_cta")}
          </Button>
          <Button
            component={Link}
            href="/create-offer"
            variant="outlined"
            sx={{ color: "#fff", borderColor: "rgba(255,255,255,.55)", fontWeight: 900 }}
          >
            {t("publish_offer")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
