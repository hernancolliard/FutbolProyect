"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { useAuth } from "@/context/AuthContext"; // Asegúrate de que la ruta sea correcta
import {
  Box,
  Card,
  CardContent,
  Typography,
  Link as MuiLink,
} from "@mui/material";

interface LoginProps {
  onClose: () => void;
}

function Login({ onClose }: LoginProps) {
  const { t } = useTranslation("common");
  // Extraemos las funciones del contexto.
  // Nota: Si 'loginWithGoogle' no existe aún en tu contexto, mira el paso 2 más abajo.
  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // CORRECCIÓN: Delegamos la petición al contexto pasando credenciales
      await login(formData.email, formData.password);
      onClose(); // Cerramos el modal solo si hubo éxito
    } catch (err: any) {
      console.error(err);
      // Intentamos mostrar el mensaje que viene del backend o uno genérico
      setError(
        err.response?.data?.message ||
          t("login_error", "Error al iniciar sesión."),
      );
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // CORRECCIÓN: Delegamos también el login de Google al contexto
      if (loginWithGoogle) {
        await loginWithGoogle(credentialResponse.credential);
        onClose();
      } else {
        console.error("loginWithGoogle no está implementado en AuthContext");
        setError("Error de configuración interno.");
      }
    } catch (err: any) {
      setError(
        err.message ||
          t("login_with_google_error", "Error al iniciar sesión con Google."),
      );
    }
  };

  const handleGoogleError = () => {
    setError(
      t(
        "login_with_google_error_retry",
        "Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.",
      ),
    );
  };

  return (
    <Card sx={{ p: 2, maxWidth: 400, mx: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          {t("login_title", "Iniciar Sesión")}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              type="email"
              name="email"
              label={t("email_placeholder", "Correo Electrónico")}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
            <TextField
              type="password"
              name="password"
              label={t("password_placeholder", "Contraseña")}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="secondary"
                onClick={onClose}
                type="button"
              >
                {t("cancel_button", "Cancelar")}
              </Button>
              <Button variant="contained" color="primary" type="submit">
                {t("login_button", "Iniciar Sesión")}
              </Button>
            </Stack>
          </Stack>
        </form>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link
            href="/auth/forgot-password"
            passHref
            style={{ textDecoration: "none" }}
          >
            <MuiLink
              component="span"
              onClick={onClose}
              sx={{ cursor: "pointer" }}
            >
              {t("forgot_your_password", "¿Olvidaste tu contraseña?")}
            </MuiLink>
          </Link>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2">
            {t("or_login_with", "O inicia sesión con:")}
          </Typography>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Login;
