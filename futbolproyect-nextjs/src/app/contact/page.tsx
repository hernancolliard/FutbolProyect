'use client';

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import apiClient from "../../lib/apiClient"; // Centralized apiClient
// import { Helmet } from "react-helmet-async"; // Replaced by Next.js metadata

// SEO Metadata for the page (static part for server components)
// For client components, dynamic metadata is set in useEffect
export const metadata = {
  title: "Contacto - FutbolProyect",
  description: "Ponte en contacto con el equipo de FutbolProyect. Envíanos tus preguntas, sugerencias o consultas a través de nuestro formulario de contacto.",
};

export default function ContactPage() {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      await apiClient.post("/contact", formData);

      setFeedback(t("contact_form_feedback", { name: formData.name, defaultValue: `¡Gracias por tu mensaje, ${formData.name}! Te contactaremos pronto.` }));
      setFormData({ name: "", email: "", message: "" }); // Limpiamos el formulario
    } catch (err) {
      setError(
        err.message || t("contact_form_error", "Ocurrió un error al enviar el mensaje.")
      );
    } finally {
      setLoading(false);
    }
  };

  // Dynamic SEO update for client components
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('contact_seo_title', 'Contacto - FutbolProyect');
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', t('contact_seo_desc', 'Ponte en contacto con el equipo de FutbolProyect. Envíanos tus preguntas, sugerencias o consultas a través de nuestro formulario de contacto.'));
      } else {
        const newMetaTag = document.createElement('meta');
        newMetaTag.name = 'description';
        newMetaTag.content = t('contact_seo_desc', 'Ponte en contacto con el equipo de FutbolProyect. Envíanos tus preguntas, sugerencias o consultas a través de nuestro formulario de contacto.');
        document.head.appendChild(newMetaTag);
      }
    }
  }, [t]);


  return (
    <Stack
      className="contact-page-container"
      alignItems="center"
      sx={{ mt: 4 }}
    >
      <Typography variant="h4" sx={{ mb: 2, color: 'white' }}>
        {t("contact_page_title", "Contáctanos")}
      </Typography>
      <Typography sx={{ mb: 3, color: 'white' }}>{t("contact_page_subtitle", "Estamos aquí para ayudarte.")}</Typography>
      <Card sx={{ maxWidth: 500, width: "100%", bgcolor: '#1a1a1a' }}> {/* Dark background for card */}
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
                rows={6}
                InputProps={{ style: { color: 'white' } }}
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: 'white' } } }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
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
          {feedback && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {feedback}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
