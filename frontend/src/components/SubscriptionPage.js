import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api";
import SubscribeButton from "./SubscribeButton";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Helmet } from "react-helmet-async";
import LoadingSpinner from "./LoadingSpinner";
import Alert from "@mui/material/Alert";

// --- Fetching Logic ---
const fetchSubscriptionPlans = async () => {
  const { data } = await apiClient.get("/subscriptions");
  return data;
};

function SubscriptionPage() {
  const { t } = useTranslation();
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <>
      <Helmet>
        <title>{t('subscriptions_seo_title', 'Planes de Suscripción - FutbolProyect')}</title>
        <meta name="description" content={t('subscriptions_seo_desc', 'Elige el plan de suscripción que mejor se adapte a tus necesidades en FutbolProyect. Opciones para ofertantes y para talentos que buscan oportunidades.')} />
      </Helmet>
      <Stack
        className="subscription-container"
        spacing={4}
        sx={{ mt: 5, alignItems: "center" }}
      >
        <Typography variant="h4">{t("subscription_plans_title")}</Typography>
        <Typography>{t("subscription_plans_subtitle")}</Typography>
        
        <ToggleButtonGroup
          color="primary"
          value={billingCycle}
          exclusive
          onChange={handleBillingCycleChange}
          aria-label="Billing Cycle"
        >
          <ToggleButton value="monthly">{t('monthly')}</ToggleButton>
          <ToggleButton value="annual">{t('annual')}</ToggleButton>
        </ToggleButtonGroup>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          className="plans"
        >
          <Card className="plan" sx={{ minWidth: 300 }}>
            <CardContent>
              <Typography variant="h6">{t("offerer_plan_title")}</Typography>
              <Typography>{t("offerer_plan_description")}</Typography>
              <Typography variant="h5" sx={{ my: 2 }}>
                {billingCycle === 'monthly' 
                  ? `U$D${monthlyPrice}/mes` 
                  : `U$D${annualPrice}/año`}
              </Typography>
              <SubscribeButton planType="ofertante" billingCycle={billingCycle} />
            </CardContent>
          </Card>
          <Card className="plan" sx={{ minWidth: 300 }}>
            <CardContent>
              <Typography variant="h6">{t("applicant_plan_title")}</Typography>
              <Typography>{t("applicant_plan_description")}</Typography>
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
    </>
  );
}

export default SubscriptionPage;