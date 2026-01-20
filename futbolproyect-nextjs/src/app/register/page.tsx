"use client";

import React from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import Register from "@/components/auth/Register"; // Reutilizamos tu componente existente

export default function RegisterPage() {
  const router = useRouter();

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
          Crear Cuenta
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
