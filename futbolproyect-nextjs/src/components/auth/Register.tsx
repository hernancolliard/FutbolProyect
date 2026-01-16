'use client';

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient"; // Centralized apiClient
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import { Box, Card, CardContent, Typography } from "@mui/material"; // Import additional Material UI components

interface RegisterProps {
  onClose: () => void;
  initialRole?: 'player' | 'club';
  onSwitchToLogin: () => void;
}

function Register({ onClose, initialRole = 'player', onSwitchToLogin }: RegisterProps) {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    tipo_usuario: initialRole === 'club' ? 'ofertante' : 'postulante',
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tipo_usuario: initialRole === 'club' ? 'ofertante' : 'postulante'
    }));
  }, [initialRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await apiClient.post("/users/register", formData);
      setSuccess(t("register_success", "Registro exitoso. ¡Revisa tu correo para confirmar tu cuenta!"));
      // Limpiamos el formulario y no cerramos para que el usuario vea el mensaje.
      setFormData({
        nombre: "",
        email: "",
        password: "",
        tipo_usuario: "postulante",
      });
    } catch (err: any) {
      setError(err.message || t("register_error", "Error en el registro."));
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // In Next.js with next-auth, you might use signIn function here
      await apiClient.post("/users/auth/google", {
        id_token: credentialResponse.credential,
      });
      setSuccess(t("register_with_google_success", "Registro/Inicio de sesión con Google exitoso."));
      onClose(); // Cierra el modal después del registro/login con Google
    } catch (err: any) {
      setError(err.message || t("register_with_google_error", "Error al registrarse/iniciar sesión con Google."));
    }
  };

  const handleGoogleError = () => {
    setError(t("register_with_google_error_retry", "Error al iniciar sesión con Google. Por favor, inténtalo de nuevo."));
  };

  return (
    <Card sx={{ p: 2, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          {t("register_title", "Registrarse")}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              type="text"
              name="nombre"
              label={t("name_placeholder", "Nombre")}
              value={formData.nombre}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              type="email"
              name="email"
              label={t("email_placeholder", "Correo Electrónico")}
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              type="password"
              name="password"
              label={t("password_placeholder", "Contraseña")}
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              select
              name="tipo_usuario"
              label={t("user_type_label", "Tipo de Usuario")}
              value={formData.tipo_usuario}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="postulante">{t("user_type_applicant", "Postulante")}</MenuItem>
              <MenuItem value="ofertante">{t("user_type_offerer", "Oferente")}</MenuItem>
            </TextField>
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
                {t("register_button", "Registrarse")}
              </Button>
            </Stack>
          </Stack>
        </form>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2">{t("or_register_with", "O registrarse con:")}</Typography>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            {t('already_have_account', '¿Ya tienes cuenta? ')}
            <Typography
              component="span"
              onClick={onSwitchToLogin}
              sx={{ cursor: 'pointer', textDecoration: 'underline', color: 'primary.main' }}
            >
              {t('login_here', 'Inicia sesión aquí')}
            </Typography>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Register;