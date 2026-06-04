"use client";

import React, { useState } from "react";
import apiClient from "@/lib/apiClient";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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

const advertisingPlans = [
  {
    name: "Plan Básico",
    subtitle: "Visibilidad Inicial",
    priceArs: "$30.000 ARS / mes",
    priceUsd: "USD 20 a USD 40 / mes",
    description:
      "Ideal para cursos, academias, servicios chicos o marcas que quieren comenzar a tener presencia en FutbolProyect.",
    includes: [
      "Banner publicitario en una sección de la web",
      "Link clickeable hacia web, Instagram, WhatsApp o landing",
      "Duración: 30 días",
      "Etiqueta de Publicidad o Sponsor",
      "Reporte simple de clicks e impresiones",
    ],
    placements: ["Página de ofertas", "Página de perfiles", "Footer", "Sección de sponsors"],
  },
  {
    name: "Plan Destacado",
    subtitle: "Mayor Alcance",
    priceArs: "$75.000 ARS / mes",
    priceUsd: "USD 50 a USD 90 / mes",
    recommended: true,
    description:
      "Ideal para agencias, cursos, empresas deportivas o academias que quieren mayor visibilidad dentro de FutbolProyect.",
    includes: [
      "Banner en Home",
      "Banner en página de ofertas o perfiles",
      "Logo en sección de sponsors/aliados",
      "Link clickeable",
      "1 publicación en Instagram o LinkedIn de FutbolProyect",
      "Duración: 30 días",
      "Reporte de clicks, impresiones y CTR",
    ],
    placements: ["Home", "Ofertas", "Perfiles", "Sección de sponsors"],
  },
  {
    name: "Sponsor Principal",
    subtitle: "Presencia Premium",
    priceArs: "$180.000 ARS / mes",
    priceUsd: "USD 120 a USD 200 / mes",
    description:
      "Ideal para agencias importantes, empresas, academias grandes, cursos reconocidos o servicios que quieren posicionarse fuerte dentro de FutbolProyect.",
    includes: [
      "Banner destacado en Home",
      "Banner en página de ofertas",
      "Banner en página de perfiles",
      "Logo destacado como sponsor principal",
      "Publicación en Instagram",
      "Publicación en LinkedIn",
      "Mención como sponsor/aliado destacado",
      "Duración: 30 días",
      "Reporte mensual completo con impresiones, clicks, CTR y ubicaciones",
    ],
    placements: ["Home", "Ofertas", "Perfiles", "Footer", "Sección de sponsors"],
  },
];

const campaignConditions = [
  "La duración mínima de una campaña es de 30 días.",
  "Todas las publicidades son revisadas antes de su publicación.",
  "FutbolProyect puede rechazar anuncios que prometan contratos garantizados, pruebas aseguradas o servicios engañosos.",
  "Los anuncios deben estar relacionados con fútbol, formación deportiva, representación, scouting, análisis, tecnología deportiva o servicios para jugadores y profesionales del deporte.",
  "Los precios pueden variar según disponibilidad, ubicación y duración de la campaña.",
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

  const handlePlanSelect = (plan: (typeof advertisingPlans)[number]) => {
    setForm((prev) => ({
      ...prev,
      budget: `${plan.name} - ${plan.priceArs}`,
      message: `Quiero solicitar el ${plan.name} (${plan.subtitle}).`,
    }));

    document
      .getElementById("publicidad-contacto")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <Box component="section" sx={{ mb: { xs: 5, md: 7 } }}>
          <Stack spacing={1.5} sx={{ maxWidth: 820, mb: 4 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 900 }}>
              Planes para publicitar en FutbolProyect
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Llegá a jugadores, clubes, agencias, scouts y profesionales del fútbol
              con espacios publicitarios pensados para el mercado futbolístico.
            </Typography>
            <Typography color="text.secondary">
              Todas las campañas son revisadas antes de ser publicadas para proteger
              la confianza de nuestra comunidad.
            </Typography>
          </Stack>

          <Grid container spacing={3} alignItems="stretch">
            {advertisingPlans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.name}>
                <Paper
                  variant="outlined"
                  sx={{
                    height: "100%",
                    p: 2.5,
                    borderRadius: 2,
                    borderColor: plan.recommended
                      ? "secondary.main"
                      : "rgba(25, 38, 52, 0.12)",
                    boxShadow: plan.recommended
                      ? "0 18px 44px rgba(25, 38, 52, 0.14)"
                      : "none",
                    position: "relative",
                  }}
                >
                  <Stack spacing={2} sx={{ height: "100%" }}>
                    {plan.recommended && (
                      <Chip
                        label="Recomendado"
                        color="secondary"
                        sx={{ width: "fit-content", fontWeight: 800 }}
                      />
                    )}

                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {plan.name}
                      </Typography>
                      <Typography color="text.secondary">{plan.subtitle}</Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="h4"
                        component="p"
                        sx={{ fontWeight: 950, color: "primary.main", lineHeight: 1.1 }}
                      >
                        {plan.priceArs}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Referencia internacional: {plan.priceUsd}
                      </Typography>
                    </Box>

                    <Typography color="text.secondary">{plan.description}</Typography>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                        Incluye
                      </Typography>
                      <Stack spacing={1}>
                        {plan.includes.map((item) => (
                          <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                            <CheckCircleIcon
                              color="success"
                              sx={{ fontSize: 18, mt: 0.15, flexShrink: 0 }}
                            />
                            <Typography variant="body2">{item}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                        Ubicaciones
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {plan.placements.map((placement) => (
                          <Chip key={placement} label={placement} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>

                    <Button
                      variant={plan.recommended ? "contained" : "outlined"}
                      color={plan.recommended ? "secondary" : "primary"}
                      fullWidth
                      onClick={() => handlePlanSelect(plan)}
                    >
                      Solicitar este plan
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper
            variant="outlined"
            sx={{
              mt: 3,
              p: { xs: 2, md: 2.5 },
              borderRadius: 2,
              bgcolor: "#f8fafc",
              borderColor: "rgba(25, 38, 52, 0.12)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
              Condiciones de publicación
            </Typography>
            <Grid container spacing={1.25}>
              {campaignConditions.map((condition) => (
                <Grid item xs={12} md={6} key={condition}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircleIcon color="primary" sx={{ fontSize: 18, mt: 0.2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {condition}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

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

          <Grid item xs={12} md={7} id="publicidad-contacto">
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

        <Paper
          variant="outlined"
          sx={{
            mt: { xs: 4, md: 6 },
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            bgcolor: "#10233f",
            color: "white",
            borderColor: "transparent",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                ¿Querés anunciar en FutbolProyect?
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.76)", maxWidth: 760 }}>
                Completá el formulario y te contactaremos para ayudarte a elegir el
                mejor espacio para tu agencia, curso, empresa o servicio deportivo.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() =>
                document
                  .getElementById("publicidad-contacto")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              sx={{ whiteSpace: "nowrap" }}
            >
              Quiero anunciar
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
