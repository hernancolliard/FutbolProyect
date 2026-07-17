"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "@/context/AuthContext";
import GoogleLoginButton from "./GoogleLoginButton";

interface LoginProps {
  onClose: () => void;
  onSwitchToRegister?: () => void;
  showCloseButton?: boolean;
}

export default function Login({
  onClose,
  onSwitchToRegister,
  showCloseButton = true,
}: LoginProps) {
  const { t } = useTranslation("common");
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTermsForGoogle, setAcceptedTermsForGoogle] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      onClose();
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          t("login_error"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!loginWithGoogle) throw new Error(t("login_configuration_error"));
      await loginWithGoogle(
        credentialResponse.credential,
        acceptedTermsForGoogle,
      );
      onClose();
    } catch (requestError: any) {
      setError(requestError?.message || t("login_with_google_error"));
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 480, mx: "auto", p: { xs: 2.5, sm: 4 } }}>
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
        <Box
          sx={{
            width: 48,
            height: 48,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: "#eaf3ff",
            color: "#1262db",
          }}
        >
          <LockOutlinedIcon />
        </Box>
        <Typography component="h1" variant="h4" align="center" sx={{ color: "#0a1930", fontWeight: 900 }}>
          {t("login_title")}
        </Typography>
        <Typography variant="body2" align="center" sx={{ color: "#64748b" }}>
          {t("login_modal_subtitle")}
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ mt: 3 }}>
          <TextField
            type="email"
            name="email"
            label={t("email_placeholder")}
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            type="password"
            name="password"
            label={t("password_placeholder")}
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="current-password"
          />
          <Box sx={{ textAlign: "right", mt: "-4px !important" }}>
            <MuiLink component={Link} href="/auth/forgot-password" onClick={onClose} sx={{ fontSize: ".85rem", fontWeight: 700 }}>
              {t("forgot_your_password")}
            </MuiLink>
          </Box>
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.25, bgcolor: "#1262db", fontWeight: 900 }}>
            {loading ? <CircularProgress size={22} color="inherit" /> : t("login_button")}
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Divider sx={{ my: 2.5, color: "#94a3b8", fontSize: ".78rem" }}>
        {t("or_login_with")}
      </Divider>
      <FormControlLabel
        sx={{ alignItems: "flex-start", mx: 0, mb: 1.5 }}
        control={
          <Checkbox
            checked={acceptedTermsForGoogle}
            onChange={(event) => setAcceptedTermsForGoogle(event.target.checked)}
            sx={{ pt: 0.2, pl: 0 }}
          />
        }
        label={
          <Typography variant="caption" sx={{ color: "#64748b", lineHeight: 1.5 }}>
            {t(
              "google_legal_acceptance_intro",
              "Si Google crea una cuenta nueva, acepto los",
            )}{" "}
            <MuiLink component={Link} href="/terms" target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 800 }}>
              {t("terms_and_conditions", "Términos y Condiciones")}
            </MuiLink>{" "}
            {t("legal_acceptance_connector", "y la")} {" "}
            <MuiLink component={Link} href="/privacy" target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 800 }}>
              {t("privacy_policy", "Política de Privacidad")}
            </MuiLink>
            {t(
              "legal_content_consent_short",
              ", incluido el uso autorizado del contenido que publique en el sitio y las redes oficiales de FutbolProyect.",
            )}
          </Typography>
        }
      />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError(t("login_with_google_error_retry"))}
        />
      </Box>

      <Typography variant="body2" align="center" sx={{ mt: 2.5, color: "#64748b" }}>
        {t("no_account_yet")}{" "}
        {onSwitchToRegister ? (
          <MuiLink component="button" type="button" onClick={onSwitchToRegister} sx={{ fontWeight: 800 }}>
            {t("register")}
          </MuiLink>
        ) : (
          <MuiLink component={Link} href="/register" sx={{ fontWeight: 800 }}>
            {t("register")}
          </MuiLink>
        )}
      </Typography>
    </Box>
  );
}
