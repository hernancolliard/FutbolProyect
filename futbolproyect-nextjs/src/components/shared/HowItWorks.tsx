"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ConnectWithoutContactOutlinedIcon from "@mui/icons-material/ConnectWithoutContactOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const steps = [
  {
    icon: <PersonAddAltOutlinedIcon />,
    title: "Creá tu perfil",
    text: "Registrate y completá tu información profesional.",
  },
  {
    icon: <CloudUploadOutlinedIcon />,
    title: "Publicá o buscá",
    text: "Publicá una oferta o descubrí talento y oportunidades.",
  },
  {
    icon: <ConnectWithoutContactOutlinedIcon />,
    title: "Conectá y avanzá",
    text: "Contactá de forma segura a través de la plataforma.",
  },
  {
    icon: <HandshakeOutlinedIcon />,
    title: "Impulsá tu carrera",
    text: "Formá alianzas y llevá tu perfil al siguiente nivel.",
  },
];

export default function HowItWorks() {
  return (
    <Box
      component="section"
      sx={{
        p: { xs: 2.5, md: 3.5 },
        color: "#fff",
        borderRadius: 2.5,
        background: "linear-gradient(115deg, #061831, #0a3269)",
        boxShadow: "0 16px 35px rgba(4, 25, 55, .15)",
      }}
    >
      <Typography
        component="h2"
        sx={{ mb: 2.5, color: "#fff", textAlign: "center", fontSize: "1.55rem", fontWeight: 900 }}
      >
        ¿Cómo funciona?
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(7, auto)" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 2, md: 1.2 },
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.title}>
            <Stack alignItems="center" sx={{ maxWidth: 210, mx: "auto", textAlign: "center" }}>
              <Box
                sx={{
                  width: 62,
                  height: 62,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  border: "1px solid rgba(78, 151, 255, .7)",
                  color: "#62a8ff",
                  "& svg": { fontSize: 31 },
                }}
              >
                {step.icon}
              </Box>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 1.3 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    bgcolor: "#1262db",
                    fontSize: ".7rem",
                    fontWeight: 900,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: ".9rem" }}>
                  {step.title}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ mt: 0.7, color: "rgba(255,255,255,.65)", lineHeight: 1.45 }}>
                {step.text}
              </Typography>
            </Stack>
            {index < steps.length - 1 && (
              <ArrowForwardRoundedIcon
                sx={{
                  display: { xs: "none", md: "block" },
                  color: "rgba(255,255,255,.45)",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}
