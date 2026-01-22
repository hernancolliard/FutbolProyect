'use client';

import React from "react";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

interface ContactFormContentProps {
  formData: {
    name: string;
    email: string;
    message: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  feedback: string;
  error: string;
  loading: boolean;
}

export default function ContactFormContent({
  formData,
  handleChange,
  handleSubmit,
  feedback,
  error,
  loading,
}: ContactFormContentProps) {
  const { t } = useTranslation('common');

  return (
    <Card sx={{ maxWidth: 400, width: "100%", bgcolor: 'primary.main' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
          {t("contact_form_title", "Envíanos un mensaje")}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              type="text"
              name="name"
              label={t("your_name_placeholder", "Tu Nombre")}
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: 'white' } } }}
            />
            <TextField
              type="email"
              name="email"
              label={t("your_email_placeholder", "Tu Email")}
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: 'white' } } }}
            />
            <TextField
              name="message"
              label={t("your_message_placeholder", "Tu Mensaje")}
              value={formData.message}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={3}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: 'white' } } }}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                t("send_message_button", "Enviar Mensaje")
              )}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
