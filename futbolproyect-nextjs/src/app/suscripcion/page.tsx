'use client';

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient"; // Centralized apiClient
import SubscribeButton from "@/components/SubscribeButton"; // Migrated SubscribeButton
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// import { Helmet } from "react-helmet-async"; // Replaced by Next.js metadata
import LoadingSpinner from "@/components/LoadingSpinner"; // Migrated LoadingSpinner
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

// --- Fetching Logic ---
const fetchSubscriptionPlans = async () => {
  const { data } = await apiClient.get("/subscriptions");
  return data;
};



export default function SubscriptionPage() {
  const { t } = useTranslation('common');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const { data: plans, isLoading, isError, error } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: fetchSubscriptionPlans,
  });

  const handleBillingCycleChange = (event, newBillingCycle) => {
    if (newBillingCycle !== null) {
      setBillingCycle(newBillingCycle);
    }
  };

  // --- Helper to find plan price ---
  const getPrice = (name) => {
    if (!plans) return null;
    const plan = plans.find(p => p.plan_name === name);
    return plan ? plan.price_usd : null;
  };

  const monthlyPrice = getPrice('monthly');
  const annualPrice = getPrice('annual');

  // Dynamic SEO update for client components
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('subscriptions_seo_title', 'Planes de Suscripción - FutbolProyect');
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', t('subscriptions_seo_desc', 'Elige el plan de suscripción que mejor se adapte a tus necesidades en FutbolProyect. Opciones para ofertantes y para talentos que buscan oportunidades.'));
      } else {
        const newMetaTag = document.createElement('meta');
        newMetaTag.name = 'description';
        newMetaTag.content = t('subscriptions_seo_desc', 'Elige el plan de suscripción que mejor se adapte a tus necesidades en FutbolProyect. Opciones para ofertantes y para talentos que buscan oportunidades.');
        document.head.appendChild(newMetaTag);
      }
    }
  }, [t]);

  if (isLoading) {
    return <LoadingSpinner text={t('loading_plans', 'Cargando planes...')} />;
  }

  if (isError) {
    return <Alert severity="error">{error.message || t('error_loading_plans', 'Error al cargar los planes de suscripción.')}</Alert>;
  }

  return (
    <Stack
      className="subscription-container"
      spacing={4}
      sx={{ mt: 5, alignItems: "center" }}
    >
      <Typography variant="h4" sx={{ color: 'white' }}>{t("subscription_plans_title", "Planes de Suscripción")}</Typography>
      <Typography sx={{ color: 'white' }}>{t("subscription_plans_subtitle", "Elige el plan que mejor se adapte a ti.")}</Typography>
      
      <ToggleButtonGroup
        color="primary"
        value={billingCycle}
        exclusive
        onChange={handleBillingCycleChange}
        aria-label="Billing Cycle"
      >
        <ToggleButton value="monthly" sx={{ color: 'white' }}>{t('monthly', 'Mensual')}</ToggleButton>
        <ToggleButton value="annual" sx={{ color: 'white' }}>{t('annual', 'Anual')}</ToggleButton>
      </ToggleButtonGroup>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        className="plans"
      >
        <Card sx={{ minWidth: 300, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6">{t("offerer_plan_title", "Plan para Ofertantes")}</Typography>
            <Typography>{t("offerer_plan_description", "Para clubes y agencias que buscan talento.")}</Typography>
            <Typography variant="h5" sx={{ my: 2 }}>
              {billingCycle === 'monthly' 
                ? `U$D${monthlyPrice}/mes` 
                : `U$D${annualPrice}/año`}
            </Typography>
            <SubscribeButton planType="ofertante" billingCycle={billingCycle} />
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 300, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6">{t("applicant_plan_title", "Plan para Postulantes")}</Typography>
            <Typography>{t("applicant_plan_description", "Para futbolistas que buscan oportunidades.")}</Typography>
            <Typography variant="h5" sx={{ my: 2 }}>
              {billingCycle === 'monthly' 
                ? `U$D${monthlyPrice}/mes` 
                : `U$D${annualPrice}/año`}
            </Typography>
            <SubscribeButton planType="postulante" billingCycle={billingCycle} />
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
}
