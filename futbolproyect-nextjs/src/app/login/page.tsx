"use client";

import React from "react";
import { Container, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Login from "@/components/auth/Login";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          {t("login_title", "Iniciar sesion")}
        </Typography>
        <Login onClose={() => router.push("/")} />
      </Paper>
    </Container>
  );
}
