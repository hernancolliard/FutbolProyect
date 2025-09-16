import React, { useState } from "react";
import apiClient from "../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";

function Register({ onClose }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    password: "",
    dni: "",
    direccion: "",
    ciudad: "",
    pais: "",
    tipo_usuario: "postulante",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await apiClient.post("/users/register", formData);
      setSuccess(t("register_success"));
      // Limpiamos el formulario y no cerramos para que el usuario vea el mensaje.
      // Opcionalmente, podríamos cerrar el modal después de unos segundos.
      setFormData({
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        password: "",
        dni: "",
        direccion: "",
        ciudad: "",
        pais: "",
        tipo_usuario: "postulante",
      });
    } catch (err) {
      setError(err.response?.data?.message || t("register_error"));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await apiClient.post("/users/auth/google", {
        id_token: credentialResponse.credential,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      setSuccess(t("register_with_google_success"));
      onClose(); // Cierra el modal después del registro/login con Google
    } catch (err) {
      setError(err.response?.data?.message || t("register_with_google_error"));
    }
  };

  const handleGoogleError = () => {
    setError(t("register_with_google_error_retry"));
  };

  return (
    <div className="form-card">
      <h2>{t("register_title")}</h2>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            type="text"
            name="nombre"
            label={t("name_placeholder")}
            value={formData.nombre}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="text"
            name="apellido"
            label={t("lastname_placeholder")}
            value={formData.apellido}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="text"
            name="telefono"
            label={t("phone_placeholder")}
            value={formData.telefono}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="email"
            name="email"
            label={t("email_placeholder")}
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="password"
            name="password"
            label={t("password_placeholder")}
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="text"
            name="dni"
            label={t("dni_placeholder")}
            value={formData.dni}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="text"
            name="direccion"
            label={t("address_placeholder")}
            value={formData.direccion}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="text"
            name="ciudad"
            label={t("city_placeholder")}
            value={formData.ciudad}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            type="text"
            name="pais"
            label={t("country_placeholder")}
            value={formData.pais}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            select
            name="tipo_usuario"
            label={t("user_type_label")}
            value={formData.tipo_usuario}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="postulante">{t("user_type_applicant")}</MenuItem>
            <MenuItem value="ofertante">{t("user_type_offerer")}</MenuItem>
          </TextField>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              onClick={onClose}
              type="button"
            >
              {t("cancel_button")}
            </Button>
            <Button variant="contained" color="primary" type="submit">
              {t("register_button")}
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
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>{t("or_register_with")}</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>
    </div>
  );
}

export default Register;
