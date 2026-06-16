"use client";

import React, { Suspense } from "react";
import { Container, Paper, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import Register from "@/components/auth/Register"; // Reutilizamos tu componente existente

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation("common");
  const initialRole = searchParams.get("role") || undefined;

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
          initialRole={initialRole}
        />
      </Paper>
    </Container>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
