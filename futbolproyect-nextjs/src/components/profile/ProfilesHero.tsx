"use client";

import React from "react";
import {
  Box,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { PLAYER_POSITION_OPTIONS } from "@/lib/profilePositions";
import { useTranslation } from "react-i18next";

type Props = {
  activePosition: string;
  onPositionChange: (position: string) => void;
};

export default function ProfilesHero({
  activePosition,
  onPositionChange,
}: Props) {
  const { t } = useTranslation("common");
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        color: "#fff",
        pt: { xs: 6, md: 8 },
        pb: { xs: 11, md: 12 },
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
          {t("profiles_hero_title_prefix")}{" "}
          <Box component="span" sx={{ color: "#2f80ff" }}>
            {t("profiles_hero_title_highlight")}
          </Box>
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
          {t("profiles_hero_text")}
        </Typography>

        <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mt: 3 }}>
          {PLAYER_POSITION_OPTIONS.map((position) => {
            const selected = activePosition === position.value;
            return (
              <Chip
                key={position.value}
                clickable
                label={t(position.labelKey, position.fallback)}
                onClick={() =>
                  onPositionChange(selected ? "" : position.value)
                }
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
