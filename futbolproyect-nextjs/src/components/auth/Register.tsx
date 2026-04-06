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
  initialRole = "jugador",
}: RegisterProps) {
  const { t } = useTranslation("common");
  const { register } = useAuth();

  // 2. CORRECCIÓN: Usamos initialRole como valor inicial
  const [rol, setRol] = useState(initialRole);
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
    setRol(initialRole);
  }, [initialRole]);

  // Derivar tipo_usuario del rol
  const tipo_usuario = ["jugador", "entrenador", "ayudante", "analista"].includes(rol) ? "postulante" : "ofertante";

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
      // Usar la función register del contexto
      await register(formData.name, formData.email, formData.password, tipo_usuario, rol);
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
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            fullWidth
          >
            <MenuItem value="jugador">{t("player", "Jugador")}</MenuItem>
            <MenuItem value="entrenador">{t("coach", "Entrenador")}</MenuItem>
            <MenuItem value="ayudante">{t("assistant", "Ayudante")}</MenuItem>
            <MenuItem value="analista">{t("analyst", "Analista")}</MenuItem>
            <MenuItem value="club">{t("club", "Club")}</MenuItem>
            <MenuItem value="agente">{t("agent", "Agente")}</MenuItem>
            <MenuItem value="scout">{t("scout", "Scout")}</MenuItem>
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
