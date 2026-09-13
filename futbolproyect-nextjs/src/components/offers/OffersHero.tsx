"use client";

import React from "react";
import {
  Box,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type OffersHeroProps = {
  activeRole: string;
  onRoleChange: (role: string) => void;
};

const roles = [
  { labelKey: "role_filter_jugador", value: "jugador" },
  { labelKey: "role_filter_entrenador", value: "entrenador" },
  { labelKey: "role_filter_analista", value: "analista" },
  { labelKey: "role_filter_scout", value: "scout" },
  { labelKey: "role_filter_preparador", value: "preparador" },
];

export default function OffersHero({
  activeRole,
  onRoleChange,
}: OffersHeroProps) {
  const { t } = useTranslation("common");
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        color: "#fff",
        pt: { xs: 6, md: 8 },
        pb: { xs: 11, md: 12 },
        overflow: "visible",
        backgroundImage:
          "linear-gradient(90deg, rgba(2, 15, 37, .98) 0%, rgba(3, 28, 66, .91) 55%, rgba(3, 21, 48, .82) 100%), url('/images/estadio-futbol.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center 55%",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "2.35rem", md: "3.35rem" },
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          {t("offers_hero_title_prefix")} <Box component="span" sx={{ color: "#2f80ff" }}>{t("offers_hero_title_highlight")}</Box>
        </Typography>
        <Typography
          sx={{
            mt: 1.5,
            maxWidth: 690,
            color: "rgba(255,255,255,.82)",
            fontSize: { xs: ".98rem", md: "1.08rem" },
            lineHeight: 1.65,
          }}
        >
          {t("all_offers_intro")}
        </Typography>

        <Stack
          direction="row"
          useFlexGap
          flexWrap="wrap"
          gap={1}
          sx={{ mt: 3 }}
        >
          {roles.map((role) => {
            const selected = activeRole === role.value;
            return (
              <Chip
                key={role.value}
                clickable
                label={t(role.labelKey)}
                onClick={() => onRoleChange(selected ? "" : role.value)}
                sx={{
                  color: "#fff",
                  border: "1px solid",
                  borderColor: selected ? "#2f80ff" : "rgba(255,255,255,.3)",
                  bgcolor: selected ? "#1262db" : "rgba(255,255,255,.06)",
                  fontWeight: 700,
                  "&:hover": {
                    bgcolor: selected ? "#1262db" : "rgba(255,255,255,.14)",
                  },
                }}
              />
            );
          })}
        </Stack>
      </Container>

    </Box>
  );
}
