"use client";
export const dynamic = "force-dynamic";
import React, { useState } from "react";
import publicApi from "@/lib/publicApi";
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

export default function ForgotPasswordPage() {
  const { t } = useTranslation("common");

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await publicApi.post("/users/forgot-password", {
        email,
      });

      setMessage(
        response.data?.message ||
          t(
            "reset_email_sent",
            "Si el correo existe, te enviamos un enlace para restablecer la contraseña.",
          ),
      );
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          t(
            "error_generic",
            "Ocurrió un error. Por favor, intentá nuevamente.",
          ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Card sx={{ maxWidth: 400, width: "100%", p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t("forgot_password_title", "¿Olvidaste tu contraseña?")}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2} mt={2}>
              <TextField
                type="email"
                label={t("email_label", "Correo Electrónico")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />

              {message && <Alert severity="success">{message}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  t("send_reset_link", "Enviar Enlace de Restablecimiento")
                )}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
