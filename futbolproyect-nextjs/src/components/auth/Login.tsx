'use client';

import React, { useState } from "react";
// import { useAuth } from "../../context/AuthContext"; // Replaced by NextAuth.js
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation"; // Use useRouter from next/navigation
import { toast } from "react-toastify";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { signIn } from "next-auth/react"; // Import signIn from next-auth/react

function Login({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  // const { login } = useAuth(); // No longer use useAuth
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Use signIn from next-auth/react
      const result = await signIn('credentials', {
        redirect: false, // Do not redirect, handle client-side
        email,
        password,
      });

      if (result?.error) {
        toast.error(result.error || t("login_error"));
      } else {
        toast.success(t("¡Inicio de sesión exitoso!"));
        onClose(); // Close modal on successful login
        router.push('/'); // Redirect to home or dashboard
      }
    } catch (error: any) {
      toast.error(error.message || t("login_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('google', {
        redirect: false, // Do not redirect, handle client-side
      });

      if (result?.error) {
        toast.error(result.error || t("login_with_google_error"));
      } else {
        toast.success(t("¡Inicio de sesión con Google exitoso!"));
        onClose();
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.message || t("login_with_google_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="form-card">
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {t("login_title")}
      </Typography>
      <form onSubmit={handleLogin}>
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : t("login_button")}
        </Button>
      </form>
      <Typography variant="body2" sx={{ mt: 2 }}>
        <Link href="/forgot-password" style={{ textDecoration: "none" }}> {/* Use href for next/link */}
          {t("forgot_your_password")}
        </Link>
      </Typography>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {t("or_login_with")}
        </Typography>
        <IconButton color="primary" onClick={handleGoogleLogin} disabled={isLoading}>
          <GoogleIcon />
        </IconButton>
      </Box>
      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button onClick={onClose}>{t("cancel_button")}</Button>
      </Box>
    </Box>
  );
}

export default Login;
