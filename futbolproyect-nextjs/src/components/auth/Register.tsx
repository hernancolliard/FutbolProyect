"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import { useAuth } from "@/context/AuthContext";

interface RegisterProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  initialRole?: string;
  showCloseButton?: boolean;
}

const normalizeRole = (role?: string) => {
  const roleMap: Record<string, string> = {
    player: "jugador",
    agent: "agente",
    user: "jugador",
  };
  return roleMap[role || ""] || role || "jugador";
};

export default function Register({
  onClose,
  onSwitchToLogin,
  initialRole = "jugador",
  showCloseButton = true,
}: RegisterProps) {
  const { t } = useTranslation("common");
  const { register } = useAuth();
  const [rol, setRol] = useState(normalizeRole(initialRole));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    affiliateCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => setRol(normalizeRole(initialRole)), [initialRole]);
  useEffect(() => {
    const ref =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("ref")
        : null;
    if (ref) {
      setFormData((current) => ({ ...current, affiliateCode: ref }));
    }
  }, []);

  const tipoUsuario = ["jugador", "entrenador", "ayudante", "analista"].includes(rol)
    ? "postulante"
    : "ofertante";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError(t("passwords_do_not_match"));
      return;
    }

    if (!acceptedTerms) {
      setError(
        t(
          "legal_acceptance_required",
          "Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte.",
        ),
      );
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        tipoUsuario,
        rol,
        formData.affiliateCode,
        acceptedTerms,
      );
      onClose();
    } catch (requestError: any) {
      setError(requestError?.message || t("register_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 560, mx: "auto", p: { xs: 2.5, sm: 4 } }}>
      {showCloseButton && (
        <IconButton
          onClick={onClose}
          aria-label={t("close")}
          sx={{ position: "absolute", top: 12, right: 12, color: "#64748b" }}
        >
          <CloseRoundedIcon />
        </IconButton>
      )}

      <Stack alignItems="center" spacing={1}>
        <Box sx={{ width: 48, height: 48, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: "#eaf3ff", color: "#1262db" }}>
          <PersonAddAltOutlinedIcon />
        </Box>
        <Typography component="h1" variant="h4" align="center" sx={{ color: "#0a1930", fontWeight: 900 }}>
          {t("register_title")}
        </Typography>
        <Typography variant="body2" align="center" sx={{ color: "#64748b" }}>
          {t("register_modal_subtitle")}
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ mt: 3 }}>
          <TextField select label={t("i_am_a")} value={rol} onChange={(event) => setRol(event.target.value)} fullWidth>
            <MenuItem value="jugador">{t("player")}</MenuItem>
            <MenuItem value="entrenador">{t("coach")}</MenuItem>
            <MenuItem value="ayudante">{t("assistant")}</MenuItem>
            <MenuItem value="analista">{t("analyst")}</MenuItem>
            <MenuItem value="club">{t("club")}</MenuItem>
            <MenuItem value="agente">{t("agent")}</MenuItem>
            <MenuItem value="scout">{t("scout")}</MenuItem>
          </TextField>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
            <TextField label={t("name")} name="name" value={formData.name} onChange={handleChange} required fullWidth autoComplete="name" sx={{ gridColumn: { sm: "1 / -1" } }} />
            <TextField type="email" label={t("email")} name="email" value={formData.email} onChange={handleChange} required fullWidth autoComplete="email" sx={{ gridColumn: { sm: "1 / -1" } }} />
            <TextField type="password" label={t("password")} name="password" value={formData.password} onChange={handleChange} required fullWidth autoComplete="new-password" />
            <TextField type="password" label={t("confirm_password")} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required fullWidth autoComplete="new-password" />
            <TextField label={t("referral_code", "Código de referido")} name="affiliateCode" value={formData.affiliateCode} onChange={handleChange} fullWidth sx={{ gridColumn: { sm: "1 / -1" } }} />
          </Box>

          <FormControlLabel
            sx={{ alignItems: "flex-start", mx: 0 }}
            control={
              <Checkbox
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                required
                inputProps={{
                  "aria-label": t(
                    "accept_legal_policies_label",
                    "Aceptar términos y política de privacidad",
                  ),
                }}
                sx={{ pt: 0.2, pl: 0 }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "#536176", lineHeight: 1.55 }}>
                {t("legal_acceptance_prefix", "Acepto los")} {" "}
                <MuiLink component={Link} href="/terms" target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 800 }}>
                  {t("terms_and_conditions", "Términos y Condiciones")}
                </MuiLink>{" "}
                {t("legal_acceptance_connector", "y la")} {" "}
                <MuiLink component={Link} href="/privacy" target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 800 }}>
                  {t("privacy_policy", "Política de Privacidad")}
                </MuiLink>
                {t(
                  "legal_content_consent",
                  ", incluido el tratamiento de mis datos y el uso de las imágenes y videos que publique para mostrar y promocionar FutbolProyect en su sitio y redes oficiales.",
                )}
              </Typography>
            }
          />

          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.25, bgcolor: "#1262db", fontWeight: 900 }}>
            {loading ? <CircularProgress size={22} color="inherit" /> : t("register_button")}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" align="center" sx={{ mt: 2.5, color: "#64748b" }}>
        {t("already_have_account")}{" "}
        <MuiLink component="button" type="button" onClick={onSwitchToLogin} sx={{ fontWeight: 800 }}>
          {t("login_link")}
        </MuiLink>
      </Typography>
    </Box>
  );
}
