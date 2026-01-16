"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { useTranslation } from "react-i18next";
import {
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Card,
  CardContent,
} from "@mui/material";

// 1. Creamos un componente interno que maneja la lógica de los parámetros
function ResetPasswordForm() {
  const { t } = useTranslation("common");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams(); // Esto causaba el error sin Suspense
  const router = useRouter();
  const token = searchParams.get("token");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("passwords_do_not_match", "Las contraseñas no coinciden."));
      return;
    }
    if (!token) {
      setError(t("invalid_token", "Token inválido."));
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await apiClient.post("/users/reset-password", {
        token,
        password,
      });
      setMessage(response.data.message);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(
        err.message ||
          t(
            "error_generic",
            "Ocurrió un error. Por favor, inténtalo de nuevo.",
          ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, width: "100%", p: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          {t("reset_password_title", "Restablecer Contraseña")}
        </Typography>
        {!token ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {t("invalid_token_or_expired", "Token inválido o expirado.")}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                type="password"
                id="password"
                label={t("new_password_label", "Nueva Contraseña")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <TextField
                type="password"
                id="confirmPassword"
                label={t(
                  "confirm_new_password_label",
                  "Confirmar Nueva Contraseña",
                )}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
              />
              {message && <Alert severity="success">{message}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  t("update_password_button", "Actualizar Contraseña")
                )}
              </Button>
            </Stack>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// 2. Componente principal exportado que envuelve al formulario en Suspense
export default function ResetPasswordPage() {
  return (
    <Box
      sx={{
        mt: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Suspense fallback={<CircularProgress />}>
        <ResetPasswordForm />
      </Suspense>
    </Box>
  );
}
