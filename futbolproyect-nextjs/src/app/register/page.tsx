"use client";

import React from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Register from "@/components/auth/Register"; // Reutilizamos tu componente existente

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "primary.main", mb: 3 }}
        >
          {t("register_title")}
        </Typography>

        {/* Usamos el componente Register que ya tienes. 
            Ajustamos los callbacks para navegar en lugar de cerrar modal. */}
        <Register
          onClose={() => router.push("/")}
          onSwitchToLogin={() => router.push("/")}
        />
      </Paper>
    </Container>
  );
}
