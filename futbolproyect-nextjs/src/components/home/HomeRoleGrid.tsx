"use client";

import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
import SportsOutlinedIcon from "@mui/icons-material/SportsOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import { useTranslation } from "react-i18next";

const roles = [
  {
    titleKey: "home_role_players_title",
    textKey: "home_role_players_text",
    icon: <SportsSoccerRoundedIcon />,
  },
  {
    titleKey: "home_role_coaches_title",
    textKey: "home_role_coaches_text",
    icon: <SportsOutlinedIcon />,
  },
  {
    titleKey: "home_role_analysts_title",
    textKey: "home_role_analysts_text",
    icon: <QueryStatsRoundedIcon />,
  },
  {
    titleKey: "home_role_scouts_title",
    textKey: "home_role_scouts_text",
    icon: <TravelExploreRoundedIcon />,
  },
  {
    titleKey: "home_role_trainers_title",
    textKey: "home_role_trainers_text",
    icon: <FitnessCenterRoundedIcon />,
  },
];

export default function HomeRoleGrid() {
  const { t } = useTranslation("common");
  return (
    <Box component="section">
      <Typography
        component="h2"
        sx={{
          mb: 2.5,
          textAlign: "center",
          color: "#0a1930",
          fontSize: { xs: "1.65rem", md: "2rem" },
          fontWeight: 900,
        }}
      >
        {t("home_roles_title_prefix")}{" "}
        <Box component="span" sx={{ color: "#1262db" }}>
          FutbolProyect
        </Box>
        {t("home_roles_title_suffix")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(2, 1fr)",
            md: "repeat(5, 1fr)",
          },
          gap: 1.5,
        }}
      >
        {roles.map((role, index) => (
          <Paper
            key={role.titleKey}
            elevation={0}
            sx={{
              p: { xs: 1.4, sm: 2.2 },
              minHeight: { xs: 155, sm: 185 },
              gridColumn: { xs: index === roles.length - 1 ? "1 / -1" : "auto", sm: "auto" },
              border: "1px solid #e0e7f0",
              borderRadius: 2.5,
              textAlign: "center",
              transition: "transform 180ms ease, box-shadow 180ms ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 14px 30px rgba(8, 34, 70, .09)",
              },
            }}
          >
            <Stack alignItems="center" spacing={1.2}>
              <Box
                sx={{
                  width: { xs: 44, sm: 52 },
                  height: { xs: 44, sm: 52 },
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  bgcolor: "#edf5ff",
                  color: "#1262db",
                  "& svg": { fontSize: { xs: 25, sm: 29 } },
                }}
              >
                {role.icon}
              </Box>
              <Typography sx={{ color: "#0a1930", fontWeight: 900 }}>
                {t(role.titleKey)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#647188", fontSize: { xs: ".78rem", sm: ".75rem" }, lineHeight: 1.45 }}>
                {t(role.textKey)}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
