"use client";

import React from "react";
import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";

export default function HomeFinalCta() {
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
        backgroundImage:
          "linear-gradient(90deg, rgba(3, 18, 42, .97), rgba(5, 40, 83, .88)), url('/images/fondo_1_lowres.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Typography
        component="h2"
        sx={{ color: "#fff", fontSize: { xs: "1.8rem", md: "2.35rem" }, fontWeight: 900 }}
      >
        Tu próxima oportunidad puede empezar hoy
      </Typography>
      <Typography sx={{ mt: 1, color: "rgba(255,255,255,.74)" }}>
        Creá tu perfil, publicá una oferta o encontrá talento dentro de la comunidad.
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
          Crear mi perfil gratis
        </Button>
        <Button
          component={Link}
          href="/all-offers"
          variant="outlined"
          sx={{ color: "#fff", borderColor: "rgba(255,255,255,.55)", fontWeight: 900 }}
        >
          Ver ofertas
        </Button>
        <Button
          component={Link}
          href="/create-offer"
          variant="outlined"
          sx={{ color: "#fff", borderColor: "rgba(255,255,255,.55)", fontWeight: 900 }}
        >
          Publicar oferta
        </Button>
      </Stack>
    </Box>
  );
}
