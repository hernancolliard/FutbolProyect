"use client";

import React, { useState } from "react";
import apiClient from "@/lib/apiClient";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import GroupsIcon from "@mui/icons-material/Groups";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

const initialForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  advertiser_type: "Marca deportiva",
  budget: "",
  message: "",
};

const advertiserTypes = [
  "Marca deportiva",
  "Club",
  "Academia",
  "Agencia",
  "Evento",
  "Servicio profesional",
];

export default function AdvertisingPageClient() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await apiClient.post("/ads/leads", form);
      setSuccess(true);
      setForm(initialForm);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "No pudimos enviar tu consulta. Revisa los datos e intentalo nuevamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="main">
      <Box
        sx={{
          bgcolor: "#10233f",
          color: "white",
          py: { xs: 7, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} sx={{ maxWidth: 820 }}>
            <Chip
              label="Publicidad directa en FutbolProyect"
              sx={{
                width: "fit-content",
                bgcolor: "rgba(255,255,255,0.12)",
                color: "white",
                borderColor: "rgba(255,255,255,0.25)",
              }}
              variant="outlined"
            />
            <Typography variant="h2" component="h1" sx={{ fontWeight: 900, lineHeight: 1.05 }}>
              Anuncia tu marca ante jugadores, clubes, agentes y scouts
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.78)", maxWidth: 760 }}>
              Ofrecemos espacios directos de sponsor dentro de la pagina principal,
              ofertas, perfiles de jugadores y footer. Sin Google Ads: gestion manual,
              ubicaciones claras y metricas propias.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Espacios disponibles
              </Typography>
              {[
                {
                  icon: <CampaignIcon />,
                  title: "Banners en secciones clave",
                  text: "Home, ofertas, perfiles, detalle del jugador y footer.",
                },
                {
                  icon: <GroupsIcon />,
                  title: "Audiencia segmentada",
                  text: "Usuarios vinculados al futbol: jugadores, clubes, academias, agentes y scouts.",
                },
                {
                  icon: <QueryStatsIcon />,
                  title: "Metricas internas",
                  text: "Seguimiento de impresiones, clicks y CTR desde el panel admin.",
                },
              ].map((item) => (
                <Paper
                  key={item.title}
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 2, borderColor: "rgba(25, 38, 52, 0.12)" }}
                >
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ color: "primary.main", mt: 0.5 }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {item.title}
                      </Typography>
                      <Typography color="text.secondary">{item.text}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper
              component="form"
              onSubmit={handleSubmit}
              variant="outlined"
              sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2 }}
            >
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Solicitar informacion
                  </Typography>
                  <Typography color="text.secondary">
                    Dejanos tus datos y te contactamos para definir ubicacion, duracion y formato.
                  </Typography>
                </Box>

                {success && (
                  <Alert severity="success">
                    Consulta enviada. El equipo de FutbolProyect te contactara a la brevedad.
                  </Alert>
                )}
                {error && <Alert severity="error">{error}</Alert>}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField name="name" label="Nombre" value={form.name} onChange={handleChange} fullWidth required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField name="company" label="Empresa o proyecto" value={form.company} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField type="email" name="email" label="Email" value={form.email} onChange={handleChange} fullWidth required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField name="phone" label="Telefono / WhatsApp" value={form.phone} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select name="advertiser_type" label="Tipo de anunciante" value={form.advertiser_type} onChange={handleChange} fullWidth>
                      {advertiserTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField name="budget" label="Presupuesto estimado" value={form.budget} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField name="website" label="Sitio web o red social" value={form.website} onChange={handleChange} fullWidth placeholder="https://..." />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="message"
                      label="Que queres promocionar?"
                      value={form.message}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={5}
                      required
                    />
                  </Grid>
                </Grid>

                <Button type="submit" variant="contained" size="large" disabled={saving}>
                  {saving ? "Enviando..." : "Enviar consulta"}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
