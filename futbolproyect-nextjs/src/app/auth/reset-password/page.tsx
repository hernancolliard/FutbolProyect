"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Import useSearchParams and useRouter
import apiClient from "@/lib/apiClient"; // Centralized apiClient
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
} from "@mui/material"; // Material UI components
export const dynamic = "force-dynamic";
export default function ResetPasswordPage() {
  const { t } = useTranslation("common");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
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
        router.push("/auth/login"); // Redirect to login after 3 seconds
      }, 3000);
    } catch (err) {
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
    <Box
      sx={{
        mt: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
    </Box>
  );
}
