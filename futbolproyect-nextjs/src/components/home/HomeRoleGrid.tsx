"use client";

import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
import SportsOutlinedIcon from "@mui/icons-material/SportsOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";

const roles = [
  {
    title: "Jugadores",
    text: "Mostrá tu perfil, destacá tu talento y encontrá tu próxima oportunidad.",
    icon: <SportsSoccerRoundedIcon />,
  },
  {
    title: "Entrenadores",
    text: "Conectá con clubes y proyectos que buscan visión y experiencia.",
    icon: <SportsOutlinedIcon />,
  },
  {
    title: "Analistas",
    text: "Impulsá tu perfil y accedé a oportunidades dentro del fútbol.",
    icon: <QueryStatsRoundedIcon />,
  },
  {
    title: "Scouts",
    text: "Descubrí talento y ampliá tu red profesional globalmente.",
    icon: <TravelExploreRoundedIcon />,
  },
  {
    title: "Preparadores",
    text: "Tu trabajo potencia el rendimiento. Encontrá tu próximo desafío.",
    icon: <FitnessCenterRoundedIcon />,
  },
];

export default function HomeRoleGrid() {
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
        ¿Para quién es{" "}
        <Box component="span" sx={{ color: "#1262db" }}>
          FutbolProyect
        </Box>
        ?
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(5, 1fr)",
          },
          gap: 1.5,
        }}
      >
        {roles.map((role) => (
          <Paper
            key={role.title}
            elevation={0}
            sx={{
              p: 2.2,
              minHeight: 185,
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
                  width: 52,
                  height: 52,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  bgcolor: "#edf5ff",
                  color: "#1262db",
                  "& svg": { fontSize: 29 },
                }}
              >
                {role.icon}
              </Box>
              <Typography sx={{ color: "#0a1930", fontWeight: 900 }}>
                {role.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "#647188", lineHeight: 1.5 }}>
                {role.text}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
