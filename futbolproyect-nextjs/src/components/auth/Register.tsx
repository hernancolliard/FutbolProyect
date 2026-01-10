'use client';

import React, { useState } from "react";
// import { useAuth } from "../../context/AuthContext"; // Replaced by NextAuth.js
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { signIn } from "next-auth/react"; // Import signIn from next-auth/react

// Mock apiClient for now (will be migrated later)
const apiClient = {
  post: async (url: string, data: any) => {
    console.log(`Mock API POST to ${url} with data:`, data);
    if (data.email === "test@example.com") {
      throw new Error("User already exists");
    }
    return { data: { message: "User registered successfully" } };
  },
};

interface RegisterProps {
    onClose: () => void;
    initialRole?: string;
}

function Register({ onClose, initialRole = "postulante" }: RegisterProps) {
  const { t } = useTranslation();
  // const { register } = useAuth(); // No longer use useAuth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t("passwords_do_not_match", "Las contraseñas no coinciden."));
      return;
    }
    setIsLoading(true);
    try {
        // Replace with actual API call to your backend for registration
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, lastName, userType }),
        });
        const data = await response.json();

        if (response.ok) {
            toast.success(t("register_success", "¡Registro exitoso! Ahora puedes iniciar sesión."));
            onClose();
        } else {
            toast.error(data.message || t("register_error", "Error en el registro."));
        }
    } catch (error: any) {
      toast.error(error.message || t("register_error", "Error en el registro."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    try {
        // Use signIn from next-auth/react for Google registration
        const result = await signIn('google', {
            redirect: false, // Do not redirect, handle client-side
        });

        if (result?.error) {
            toast.error(result.error || t("register_with_google_error", "Error al registrarse con Google."));
        } else {
            toast.success(t("register_with_google_success", "¡Registro y sesión exitosos con Google!"));
            onClose();
            // router.push('/'); // No redirect needed if it's a modal
        }
    } catch (error: any) {
      toast.error(error.message || t("register_with_google_error", "Error al registrarse con Google."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="form-card">
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {t("register_title")}
      </Typography>
      <form onSubmit={handleRegister}>
        <TextField
          label={t("name_placeholder")}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t("lastname_placeholder")}
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t("email_placeholder")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t("password_placeholder")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t("confirm_new_password_label")}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>{t("user_type_offerer")}</InputLabel>
          <Select
            value={userType}
            label={t("user_type_offerer")}
            onChange={(e) => setUserType(e.target.value as string)}
          >
            <MenuItem value="postulante">
              {t("user_type_applicant")}
            </MenuItem>
            <MenuItem value="ofertante">
              {t("user_type_offerer")}
            </MenuItem>
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : t("register_button")}
        </Button>
      </form>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {t("or_register_with")}
        </Typography>
        <IconButton color="primary" onClick={handleGoogleRegister} disabled={isLoading}>
          <GoogleIcon />
        </IconButton>
      </Box>
      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button onClick={onClose}>{t("cancel_button")}</Button>
      </Box>
    </Box>
  );
}

export default Register;
