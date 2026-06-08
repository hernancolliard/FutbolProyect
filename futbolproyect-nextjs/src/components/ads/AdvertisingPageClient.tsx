"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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

export default function AdvertisingPageClient() {
  const { t } = useTranslation("common");
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const advertiserTypes = [
    { value: "Marca deportiva", label: t("advertising_type_sports_brand") },
    { value: "Club", label: t("advertising_type_club") },
    { value: "Academia", label: t("advertising_type_academy") },
    { value: "Agencia", label: t("advertising_type_agency") },
    { value: "Evento", label: t("advertising_type_event") },
    { value: "Servicio profesional", label: t("advertising_type_professional_service") },
  ];

  const advertisingPlans = [
    {
      name: t("advertising_plan_basic_name"),
      subtitle: t("advertising_plan_basic_subtitle"),
      priceArs: "$30.000 ARS / mes",
      priceUsd: "USD 20 / mes",
      description: t("advertising_plan_basic_description"),
      includes: [
        t("advertising_plan_basic_include_1"),
        t("advertising_plan_basic_include_2"),
        t("advertising_plan_basic_include_3"),
        t("advertising_plan_basic_include_4"),
        t("advertising_plan_basic_include_5"),
      ],
      placements: [
        t("advertising_placement_offers_page"),
        t("advertising_placement_profiles_page"),
        t("advertising_placement_footer"),
        t("advertising_placement_sponsors_section"),
      ],
    },
    {
      name: t("advertising_plan_featured_name"),
      subtitle: t("advertising_plan_featured_subtitle"),
      priceArs: "$75.000 ARS / mes",
      priceUsd: "USD 50 / mes",
      recommended: true,
      description: t("advertising_plan_featured_description"),
      includes: [
        t("advertising_plan_featured_include_1"),
        t("advertising_plan_featured_include_2"),
        t("advertising_plan_featured_include_3"),
        t("advertising_plan_featured_include_4"),
        t("advertising_plan_featured_include_5"),
        t("advertising_plan_featured_include_6"),
        t("advertising_plan_featured_include_7"),
      ],
      placements: [
        t("advertising_placement_home"),
        t("advertising_placement_offers"),
        t("advertising_placement_profiles"),
        t("advertising_placement_sponsors_section"),
      ],
    },
    {
      name: t("advertising_plan_sponsor_name"),
      subtitle: t("advertising_plan_sponsor_subtitle"),
      priceArs: "$180.000 ARS / mes",
      priceUsd: "USD 120 / mes",
      description: t("advertising_plan_sponsor_description"),
      includes: [
        t("advertising_plan_sponsor_include_1"),
        t("advertising_plan_sponsor_include_2"),
        t("advertising_plan_sponsor_include_3"),
        t("advertising_plan_sponsor_include_4"),
        t("advertising_plan_sponsor_include_5"),
        t("advertising_plan_sponsor_include_6"),
        t("advertising_plan_sponsor_include_7"),
        t("advertising_plan_sponsor_include_8"),
        t("advertising_plan_sponsor_include_9"),
      ],
      placements: [
        t("advertising_placement_home"),
        t("advertising_placement_offers"),
        t("advertising_placement_profiles"),
        t("advertising_placement_footer"),
        t("advertising_placement_sponsors_section"),
      ],
    },
  ];

  const campaignConditions = [
    t("advertising_condition_1"),
    t("advertising_condition_2"),
    t("advertising_condition_3"),
    t("advertising_condition_4"),
    t("advertising_condition_5"),
  ];

  const availableSpaces = [
    {
      icon: <CampaignIcon />,
      title: t("advertising_space_banners_title"),
      text: t("advertising_space_banners_text"),
    },
    {
      icon: <GroupsIcon />,
      title: t("advertising_space_audience_title"),
      text: t("advertising_space_audience_text"),
    },
    {
      icon: <QueryStatsIcon />,
      title: t("advertising_space_metrics_title"),
      text: t("advertising_space_metrics_text"),
    },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanSelect = (plan: (typeof advertisingPlans)[number]) => {
    setForm((prev) => ({
      ...prev,
      budget: `${plan.name} - ${plan.priceArs}`,
      message: t("advertising_selected_plan_message", {
        name: plan.name,
        subtitle: plan.subtitle,
      }),
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
      setError(requestError.response?.data?.message || t("advertising_submit_error"));
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
              label={t("advertising_hero_badge")}
              sx={{
                width: "fit-content",
                bgcolor: "rgba(255,255,255,0.12)",
                color: "white",
                borderColor: "rgba(255,255,255,0.25)",
              }}
              variant="outlined"
            />
            <Typography variant="h2" component="h1" sx={{ fontWeight: 900, lineHeight: 1.05 }}>
              {t("advertising_hero_title")}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.78)", maxWidth: 760 }}>
              {t("advertising_hero_subtitle")}
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Box component="section" sx={{ mb: { xs: 5, md: 7 } }}>
          <Stack spacing={1.5} sx={{ maxWidth: 820, mb: 4 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 900 }}>
              {t("advertising_plans_title")}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {t("advertising_plans_subtitle")}
            </Typography>
            <Typography color="text.secondary">{t("advertising_plans_note")}</Typography>
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
                        label={t("recommended")}
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
                        {t("advertising_international_reference", { price: plan.priceUsd })}
                      </Typography>
                    </Box>

                    <Typography color="text.secondary">{plan.description}</Typography>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                        {t("includes")}
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
                        {t("placements")}
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
                      {t("advertising_request_plan")}
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
              {t("advertising_conditions_title")}
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
                {t("advertising_spaces_title")}
              </Typography>
              {availableSpaces.map((item) => (
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
                    {t("advertising_form_title")}
                  </Typography>
                  <Typography color="text.secondary">{t("advertising_form_subtitle")}</Typography>
                </Box>

                {success && <Alert severity="success">{t("advertising_submit_success")}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField name="name" label={t("name_label")} value={form.name} onChange={handleChange} fullWidth required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField name="company" label={t("company_project_label")} value={form.company} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField type="email" name="email" label={t("email")} value={form.email} onChange={handleChange} fullWidth required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField name="phone" label={t("phone_whatsapp_label")} value={form.phone} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select name="advertiser_type" label={t("advertiser_type_label")} value={form.advertiser_type} onChange={handleChange} fullWidth>
                      {advertiserTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField name="budget" label={t("estimated_budget_label")} value={form.budget} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField name="website" label={t("website_social_label")} value={form.website} onChange={handleChange} fullWidth placeholder="https://..." />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="message"
                      label={t("promotion_message_label")}
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
                  {saving ? t("sending") : t("send_inquiry")}
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
                {t("advertising_cta_title")}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.76)", maxWidth: 760 }}>
                {t("advertising_cta_text")}
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
              {t("advertising_cta_button")}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
