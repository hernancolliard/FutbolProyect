"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

interface ContactFormContentProps {
  formData: {
    name: string;
    email: string;
    message: string;
  };
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  feedback: string;
  error: string;
  loading: boolean;
  compact?: boolean;
}

export default function ContactFormContent({
  formData,
  handleChange,
  handleSubmit,
  feedback,
  error,
  loading,
  compact = false,
}: ContactFormContentProps) {
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#f8fafc",
      borderRadius: 1.7,
      "& fieldset": { borderColor: "#dce4ef" },
      "&:hover fieldset": { borderColor: "#9db7da" },
      "&.Mui-focused fieldset": { borderColor: "#1262db" },
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        minWidth: 0,
        p: { xs: 2.25, sm: compact ? 2.5 : 3.5 },
        border: "1px solid #dfe6ef",
        borderRadius: 2.8,
        boxShadow: "0 14px 35px rgba(8, 34, 70, .08)",
      }}
    >
      <Typography
        component="h2"
        sx={{ color: "#0a1930", fontSize: compact ? "1.2rem" : "1.4rem", fontWeight: 900 }}
      >
        Enviá tu consulta
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.6, mb: 2.5, color: "#65738a" }}>
        Completá los datos y contanos cómo podemos ayudarte.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: compact ? "1fr" : "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <TextField
              type="text"
              name="name"
              label="Nombre"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="name"
              sx={fieldSx}
            />
            <TextField
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="email"
              sx={fieldSx}
            />
          </Box>
          <TextField
            name="message"
            label="Mensaje"
            value={formData.message}
            onChange={handleChange}
            required
            fullWidth
            multiline
            minRows={compact ? 4 : 5}
            sx={fieldSx}
          />

          {feedback && <Alert severity="success">{feedback}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? undefined : <SendRoundedIcon />}
            disabled={loading}
            sx={{
              alignSelf: { xs: "stretch", sm: "flex-start" },
              minWidth: 180,
              py: 1.15,
              bgcolor: "#1262db",
              fontWeight: 900,
              "&:hover": { bgcolor: "#0d4faf" },
            }}
          >
            {loading ? <CircularProgress size={23} color="inherit" /> : "Enviar mensaje"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
