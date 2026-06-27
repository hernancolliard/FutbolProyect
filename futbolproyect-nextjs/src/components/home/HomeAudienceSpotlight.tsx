"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Paper, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const audiences = [
  {
    title: "Para jugadores y staff",
    text: "Mostrá tu talento, encontrá el equipo ideal y da el siguiente paso en tu carrera.",
    image: "/mision.webp",
    href: "/register",
    action: "Crear mi perfil",
  },
  {
    title: "Para clubes y agencias",
    text: "Publicá oportunidades y encontrá profesionales para tu proyecto.",
    image: "/images/fondo_1_lowres.webp",
    href: "/create-offer",
    action: "Publicar oferta",
  },
  {
    title: "Para scouts y reclutadores",
    text: "Filtrá, evaluá y conectá con talento desde un solo lugar.",
    image: "/nosotros.webp",
    href: "/perfiles",
    action: "Buscar perfiles",
  },
];

export default function HomeAudienceSpotlight() {
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
          key={audience.title}
          elevation={0}
          sx={{
            p: 1.5,
            border: "1px solid #dfe6ef",
            borderRadius: 2.5,
            overflow: "hidden",
          }}
        >
          <Typography sx={{ mb: 1, color: "#0a1930", fontWeight: 900 }}>
            {audience.title}
          </Typography>
          <Box sx={{ position: "relative", height: 155, borderRadius: 1.7, overflow: "hidden" }}>
            <Image
              src={audience.image}
              alt={audience.title}
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
            {audience.text}
          </Typography>
          <Button
            component={Link}
            href={audience.href}
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ mt: 1, px: 0, fontWeight: 900 }}
          >
            {audience.action}
          </Button>
        </Paper>
      ))}
    </Box>
  );
}
