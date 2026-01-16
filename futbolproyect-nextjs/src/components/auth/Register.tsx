"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  MenuItem,
  Link as MuiLink,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Asumiendo que tienes un register en tu contexto, si no, usa apiClient directamente

// 1. CORRECCIÓN: Definimos initialRole en las props
interface RegisterProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  initialRole?: string;
}

export default function Register({
  onClose,
  onSwitchToLogin,
  initialRole = "user",
}: RegisterProps) {
  const { t } = useTranslation("common");
  const { login } = useAuth(); // Usamos login para auto-loguear tras registro, o register si existe

  // 2. CORRECCIÓN: Usamos initialRole como valor inicial
  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. CORRECCIÓN: Actualizamos el rol si cambia la prop (por si el modal se reabre)
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwords_do_not_match", "Las contraseñas no coinciden"));
      return;
    }

    setLoading(true);
    try {
      // Aquí deberías llamar a tu función de registro.
      // Si usas apiClient directo: await apiClient.post('/users/register', { ...formData, role });
      // Si usas el contexto: await register({ ...formData, role });

      // Ejemplo usando fetch directo para asegurar funcionalidad si no tienes register en context:
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
      const res = await fetch(`${apiUrl}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.name,
          email: formData.email,
          password: formData.password,
          tipo_usuario: role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error en el registro");
      }

      // Si todo sale bien, intentamos loguear automáticamente o cerramos
      await login(formData.email, formData.password);
      onClose();
    } catch (err: any) {
      setError(err.message || t("register_error", "Error al registrarse."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "90%", sm: 400 },
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom align="center">
        {t("register_title", "Crear Cuenta")}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {/* Selector de Rol */}
          <TextField
            select
            label={t("i_am_a", "Soy un...")}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
          >
            <MenuItem value="player">{t("player", "Jugador")}</MenuItem>
            <MenuItem value="club">{t("club", "Club")}</MenuItem>
            <MenuItem value="scout">{t("scout", "Ojeador")}</MenuItem>
            <MenuItem value="agent">{t("agent", "Agente")}</MenuItem>
            <MenuItem value="user">{t("fan", "Aficionado")}</MenuItem>
          </TextField>

          <TextField
            label={t("name", "Nombre Completo")}
            name="name"
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="email"
            label={t("email")}
            name="email"
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="password"
            label={t("password")}
            name="password"
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="password"
            label={t("confirm_password", "Confirmar Contraseña")}
            name="confirmPassword"
            onChange={handleChange}
            required
            fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading
              ? t("loading", "Cargando...")
              : t("register_button", "Registrarse")}
          </Button>
        </Stack>
      </form>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2">
          {t("already_have_account", "¿Ya tienes cuenta?")}{" "}
          <MuiLink
            component="button"
            onClick={onSwitchToLogin}
            sx={{ verticalAlign: "baseline" }}
          >
            {t("login_link", "Inicia Sesión")}
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
