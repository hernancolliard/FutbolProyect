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
import { useAuth } from "@/context/AuthContext";

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

  const [rol, setRol] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRol(initialRole);
  }, [initialRole]);

  const tipo_usuario = ["jugador", "entrenador", "ayudante", "analista"].includes(rol)
    ? "postulante"
    : "ofertante";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwords_do_not_match"));
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, tipo_usuario, rol);
      onClose();
    } catch (err: any) {
      setError(err.message || t("register_error"));
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
        {t("register_title")}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            select
            label={t("i_am_a")}
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            fullWidth
          >
            <MenuItem value="jugador">{t("player")}</MenuItem>
            <MenuItem value="entrenador">{t("coach")}</MenuItem>
            <MenuItem value="ayudante">{t("assistant")}</MenuItem>
            <MenuItem value="analista">{t("analyst")}</MenuItem>
            <MenuItem value="club">{t("club")}</MenuItem>
            <MenuItem value="agente">{t("agent")}</MenuItem>
            <MenuItem value="scout">{t("scout")}</MenuItem>
          </TextField>

          <TextField
            label={t("name")}
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
            label={t("confirm_password")}
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
            {loading ? t("loading") : t("register_button")}
          </Button>
        </Stack>
      </form>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2">
          {t("already_have_account")}{" "}
          <MuiLink
            component="button"
            onClick={onSwitchToLogin}
            sx={{ verticalAlign: "baseline" }}
          >
            {t("login_link")}
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
