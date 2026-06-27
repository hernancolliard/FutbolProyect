"use client";

import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

const trustItems = [
  {
    icon: <VerifiedOutlinedIcon />,
    title: "Perfiles completos",
    text: "Información profesional, material deportivo y experiencia en un solo lugar.",
  },
  {
    icon: <FactCheckOutlinedIcon />,
    title: "Ofertas moderadas",
    text: "Revisamos cada publicación para sostener una comunidad seria.",
  },
  {
    icon: <SecurityOutlinedIcon />,
    title: "Contacto seguro",
    text: "Conversaciones dentro de la plataforma con privacidad.",
  },
  {
    icon: <PublicOutlinedIcon />,
    title: "Alcance global",
    text: "Clubes y profesionales conectados desde distintas ubicaciones.",
  },
];

const networkItems = [
  {
    icon: <HubOutlinedIcon />,
    title: "Una red profesional",
    text: "Talento, clubes y agencias conectados.",
  },
  {
    icon: <PsychologyOutlinedIcon />,
    title: "Oportunidades reales",
    text: "Roles y proyectos dentro del fútbol.",
  },
  {
    icon: <HandshakeOutlinedIcon />,
    title: "Conexiones útiles",
    text: "Relaciones profesionales que generan valor.",
  },
  {
    icon: <TrendingUpOutlinedIcon />,
    title: "Crecimiento continuo",
    text: "Herramientas para potenciar cada perfil.",
  },
];

export default function HomeTrustSignals() {
  return (
    <Box component="section">
      <Typography
        component="h2"
        sx={{ mb: 2, textAlign: "center", color: "#0a1930", fontSize: "1.45rem", fontWeight: 900 }}
      >
        Más confianza desde el primer clic
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 1.5,
        }}
      >
        {trustItems.map((item) => (
          <Paper
            key={item.title}
            elevation={0}
            sx={{ p: 2.2, textAlign: "center", border: "1px solid #dfe6ef", borderRadius: 2.3 }}
          >
            <Box sx={{ color: "#1262db", "& svg": { fontSize: 30 } }}>{item.icon}</Box>
            <Typography sx={{ mt: 0.8, color: "#0a1930", fontWeight: 900 }}>
              {item.title}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.6, color: "#65738a", lineHeight: 1.5, display: "block" }}>
              {item.text}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          mt: 4,
          pt: 3.5,
          borderTop: "1px solid #e2e8f0",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.25fr repeat(4, 1fr)" },
          gap: 2.5,
          alignItems: "center",
        }}
      >
        <Box>
          <Typography sx={{ color: "#0a1930", fontSize: "1.2rem", fontWeight: 900 }}>
            Una red profesional para el fútbol
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.8, color: "#65738a", lineHeight: 1.55 }}>
            FutbolProyect conecta jugadores, entrenadores, analistas, scouts,
            preparadores, agencias y clubes en una misma plataforma.
          </Typography>
        </Box>
        {networkItems.map((item) => (
          <Stack key={item.title} alignItems="center" sx={{ textAlign: "center" }}>
            <Box sx={{ color: "#315b92", "& svg": { fontSize: 28 } }}>{item.icon}</Box>
            <Typography sx={{ mt: 0.7, color: "#0a1930", fontWeight: 900, fontSize: ".86rem" }}>
              {item.title}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.4, color: "#65738a" }}>
              {item.text}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
