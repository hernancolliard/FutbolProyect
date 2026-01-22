'use client';

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import ContactFormContent from "./ContactFormContent";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import apiClient from "@/lib/apiClient"; // Corrected apiClient import

export default function ContactPageClient() {
  const { t } = useTranslation('common');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      await apiClient.post("/contact", formData);

      setFeedback(t("contact_form_feedback", { name: formData.name, defaultValue: `¡Gracias por tu mensaje, ${formData.name}! Te contactaremos pronto.` }));
      setFormData({ name: "", email: "", message: "" }); // Limpiamos el formulario
    } catch (err: any) {
      setError(
        err.message || t("contact_form_error", "Ocurrió un error al enviar el mensaje.")
      );
    } finally {
      setLoading(false);
    }
  };

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
      <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
        Email: info@futbolproyect.com
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setShowModal(true)}
      >
        {t("contact_form_button", "Ir al Formulario de Contacto")}
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ContactFormContent
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          feedback={feedback}
          error={error}
          loading={loading}
        />
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
      </Modal>
    </Stack>
  );
}
