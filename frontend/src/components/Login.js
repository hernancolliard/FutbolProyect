import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { useAuth } from "../context/AuthContext";

function Login({ onClose }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiClient.post("/users/login", formData);
      login();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t("login_error"));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await apiClient.post("/users/auth/google", {
        id_token: credentialResponse.credential,
      });
      login();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t("login_with_google_error"));
    }
  };

  const handleGoogleError = () => {
    setError(t("login_with_google_error_retry"));
  };

  return (
    <div className="form-card">
      <h2>{t("login_title")}</h2>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            type="email"
            name="email"
            label={t("email_placeholder")}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
          />
          <TextField
            type="password"
            name="password"
            label={t("password_placeholder")}
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
              {t("cancel_button")}
            </Button>
            <Button variant="contained" color="primary" type="submit">
              {t("login_button")}
            </Button>
          </Stack>
        </Stack>
      </form>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <Link to="/forgot-password" onClick={onClose}>
          {t("forgot_your_password")}
        </Link>
      </div>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>{t("or_login_with")}</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>
    </div>
  );
}

export default Login;