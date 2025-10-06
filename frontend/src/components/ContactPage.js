import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import apiClient from "../services/api"; // Importamos apiClient

function ContactPage() {
  const { t } = useTranslation();
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
      // Hacemos la llamada a nuestro nuevo endpoint del backend
      await apiClient.post("/contact", formData);

      setFeedback(t("contact_form_feedback", { name: formData.name }));
      setFormData({ name: "", email: "", message: "" }); // Limpiamos el formulario
    } catch (err) {
      setError(
        err.response?.data?.message || "Ocurrió un error al enviar el mensaje."
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
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t("contact_page_title")}
      </Typography>
      <Typography sx={{ mb: 3 }}>{t("contact_page_subtitle")}</Typography>
      <Card sx={{ maxWidth: 500, width: "100%" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("contact_form_title")}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                type="text"
                name="name"
                label={t("your_name_placeholder")}
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                type="email"
                name="email"
                label={t("your_email_placeholder")}
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="message"
                label={t("your_message_placeholder")}
                value={formData.message}
                onChange={handleChange}
                required
                fullWidth
                multiline
                rows={6}
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
                  t("send_message_button")
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

export default ContactPage;
