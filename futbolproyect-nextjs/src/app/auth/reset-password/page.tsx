"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

function ResetPasswordForm() {
  const { t } = useTranslation("common");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(t("invalid_token", "Token inválido o expirado."));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwords_do_not_match", "Las contraseñas no coinciden."));
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await publicApi.post("/users/reset-password", {
        token,
        password,
      });

      setMessage(
        response.data?.message ||
          t("password_updated", "Contraseña actualizada correctamente."),
      );

      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
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
    <Card sx={{ maxWidth: 400, width: "100%", p: 2 }}>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom>
          {t("reset_password_title", "Restablecer Contraseña")}
        </Typography>

        {!token ? (
          <Alert severity="error">
            {t("invalid_token_or_expired", "Token inválido o expirado.")}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} mt={2}>
              <TextField
                type="password"
                label={t("new_password_label", "Nueva Contraseña")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />

              <TextField
                type="password"
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

export default function ResetPasswordPage() {
  return (
    <Box
      sx={{
        mt: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Suspense fallback={<CircularProgress />}>
        <ResetPasswordForm />
      </Suspense>
    </Box>
  );
}
