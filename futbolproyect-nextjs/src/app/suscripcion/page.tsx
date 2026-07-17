"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import apiClient from "@/lib/apiClient";
import SubscribeButton from "@/components/SubscribeButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";

type SubscriptionPlan = {
  id?: number;
  plan_name: string;
  price_usd: number | string;
  price_mp?: number | string;
  is_active?: boolean;
};

const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const { data } = await apiClient.get("/subscriptions");
  return Array.isArray(data) ? data : [];
};

const planCards = [
  {
    type: "ofertante",
    titleKey: "subscription_clubs_title",
    subtitleKey: "subscription_clubs_subtitle",
    icon: <BusinessOutlinedIcon />,
    benefitKeys: ["subscription_clubs_benefit_1", "subscription_clubs_benefit_2", "subscription_clubs_benefit_3", "subscription_clubs_benefit_4"],
  },
  {
    type: "postulante",
    titleKey: "subscription_professionals_title",
    subtitleKey: "subscription_professionals_subtitle",
    icon: <PersonSearchOutlinedIcon />,
    benefitKeys: ["subscription_professionals_benefit_1", "subscription_professionals_benefit_2", "subscription_professionals_benefit_3", "subscription_professionals_benefit_4"],
  },
];

const freeBenefitKeys = [
  "subscription_free_benefit_1",
  "subscription_free_benefit_2",
  "subscription_free_benefit_3",
];

const paidBenefitKeys = [
  "subscription_paid_benefit_1",
  "subscription_paid_benefit_2",
  "subscription_paid_benefit_3",
  "subscription_paid_benefit_4",
];

export default function SubscriptionPage() {
  const { t } = useTranslation("common");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );

  const { data: plans = [], isLoading, isError, error } = useQuery<
    SubscriptionPlan[],
    Error
  >({
    queryKey: ["subscriptionPlans"],
    queryFn: fetchSubscriptionPlans,
  });

  useEffect(() => {
    document.title = t("subscription_meta_title");
    const description = t("subscription_meta_description");
    let metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
  }, [t]);

  const selectedPlan = plans.find((plan) => plan.plan_name === billingCycle);
  const price = selectedPlan?.price_usd;
  const formattedPrice =
    price !== undefined && price !== null && price !== ""
      ? `U$D ${price}`
      : t("consult_price");

  if (isLoading) {
    return <LoadingSpinner text={t("loading_plans")} />;
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          {error.message || t("subscription_load_error")}
        </Alert>
      </Container>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId:
          process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "YOUR_PAYPAL_CLIENT_ID",
        currency: "USD",
      }}
    >
      <Box sx={{ minHeight: "100vh", bgcolor: "#f7f9fc", pb: { xs: 7, md: 10 } }}>
        <Box
          component="section"
          sx={{
            color: "#fff",
            pt: { xs: 6, md: 8 },
            pb: { xs: 10, md: 11 },
            backgroundImage:
              "linear-gradient(90deg, rgba(2, 15, 37, .98), rgba(3, 31, 70, .9)), url('/images/estadio-futbol.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center 58%",
          }}
        >
          <Container maxWidth="lg" sx={{ textAlign: "center" }}>
            <Chip
              icon={<SportsSoccerOutlinedIcon />}
              label={t("subscription_badge")}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,.09)",
                border: "1px solid rgba(255,255,255,.22)",
                fontWeight: 800,
                "& .MuiChip-icon": { color: "#62a8ff" },
              }}
            />
            <Typography
              component="h1"
              sx={{
                mt: 2,
                color: "#fff",
                fontSize: { xs: "2.35rem", md: "3.45rem" },
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                fontWeight: 900,
              }}
            >
              {t("subscription_title_prefix")}{" "}
              <Box component="span" sx={{ color: "#2f80ff" }}>
                {t("subscription_title_highlight")}
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                mx: "auto",
                maxWidth: 700,
                color: "rgba(255,255,255,.76)",
                fontSize: { xs: "1rem", md: "1.08rem" },
              }}
            >
              {t("subscription_intro")}
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: { xs: -6, md: -5 }, position: "relative" }}>
          <Paper
            elevation={0}
            sx={{
              mx: "auto",
              mb: 4,
              p: 1,
              width: "fit-content",
              maxWidth: "100%",
              border: "1px solid #dfe6ef",
              borderRadius: 2.5,
              boxShadow: "0 14px 35px rgba(8, 34, 70, .12)",
            }}
          >
            <ToggleButtonGroup
              value={billingCycle}
              exclusive
              onChange={(_event, value: "monthly" | "annual" | null) => {
                if (value) setBillingCycle(value);
              }}
              aria-label={t("billing_cycle")}
              sx={{
                "& .MuiToggleButton-root": {
                  minWidth: { xs: 130, sm: 165 },
                  px: { xs: 2, sm: 3 },
                  py: 1.1,
                  border: 0,
                  borderRadius: "10px !important",
                  color: "#526179",
                  fontWeight: 900,
                },
                "& .Mui-selected": {
                  color: "#fff !important",
                  bgcolor: "#1262db !important",
                },
              }}
            >
              <ToggleButton value="monthly">{t("monthly")}</ToggleButton>
              <ToggleButton value="annual">{t("annual")}</ToggleButton>
            </ToggleButtonGroup>
          </Paper>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 2.5,
              maxWidth: 930,
              mx: "auto",
            }}
          >
            {planCards.map((plan, index) => (
              <Card
                key={plan.type}
                elevation={0}
                sx={{
                  minWidth: 0,
                  overflow: "visible",
                  border: "1px solid",
                  borderColor: index === 0 ? "rgba(18, 98, 219, .45)" : "#dfe6ef",
                  borderRadius: 3,
                  boxShadow:
                    index === 0
                      ? "0 18px 42px rgba(18, 98, 219, .12)"
                      : "0 10px 28px rgba(8, 34, 70, .06)",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    "&:last-child": { pb: { xs: 2.5, sm: 3.5 } },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 2,
                        bgcolor: "#edf5ff",
                        color: "#1262db",
                      }}
                    >
                      {plan.icon}
                    </Box>
                    <Box>
                      <Typography
                        component="h2"
                        sx={{ color: "#0a1930", fontSize: "1.2rem", fontWeight: 900 }}
                      >
                        {t(plan.titleKey)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.3, color: "#65738a" }}>
                        {t(plan.subtitleKey)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2.5 }} />

                  <Stack direction="row" alignItems="flex-end" spacing={0.7}>
                    <Typography
                      sx={{
                        color: "#0a1930",
                        fontSize: { xs: "2.3rem", sm: "2.8rem" },
                        lineHeight: 1,
                        fontWeight: 900,
                      }}
                    >
                      {formattedPrice}
                    </Typography>
                    {price !== undefined && price !== null && price !== "" && (
                      <Typography sx={{ pb: 0.3, color: "#758196" }}>
                        /{billingCycle === "monthly" ? t("month") : t("year")}
                      </Typography>
                    )}
                  </Stack>

                  <Stack spacing={1.3} sx={{ my: 3 }}>
                    {plan.benefitKeys.map((benefitKey) => (
                      <Stack key={benefitKey} direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleRoundedIcon sx={{ mt: 0.1, color: "#1262db", fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: "#3f4d62", lineHeight: 1.55 }}>
                          {t(benefitKey)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <SubscribeButton
                    planType={plan.type}
                    billingCycle={billingCycle}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>

          <Alert severity="info" sx={{ mt: 3, mx: "auto", maxWidth: 930 }}>
            {t("subscription_featured_offer_separate_purchase")}
          </Alert>

          <Paper
            elevation={0}
            sx={{
              mt: 4,
              mx: "auto",
              maxWidth: 930,
              p: { xs: 2.5, md: 3 },
              border: "1px solid #dfe6ef",
              borderRadius: 2.5,
              bgcolor: "#fff",
            }}
          >
            <Typography
              component="h2"
              sx={{ color: "#0a1930", fontSize: "1.35rem", fontWeight: 900 }}
            >
              {t("subscription_comparison_title")}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.7, color: "#65738a" }}>
              {t("subscription_comparison_intro")}
            </Typography>

            <Box
              sx={{
                mt: 2.5,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {[
                {
                  title: t("subscription_free_column_title"),
                  benefits: freeBenefitKeys,
                  color: "#65738a",
                  bgcolor: "#f7f9fc",
                },
                {
                  title: t("subscription_paid_column_title"),
                  benefits: paidBenefitKeys,
                  color: "#1262db",
                  bgcolor: "#edf5ff",
                },
              ].map((column) => (
                <Box
                  key={column.title}
                  sx={{
                    p: 2,
                    border: "1px solid #dfe6ef",
                    borderRadius: 2,
                    bgcolor: column.bgcolor,
                  }}
                >
                  <Typography sx={{ color: "#0a1930", fontWeight: 900 }}>
                    {column.title}
                  </Typography>
                  <Stack spacing={1.1} sx={{ mt: 1.5 }}>
                    {column.benefits.map((benefitKey) => (
                      <Stack
                        key={benefitKey}
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                      >
                        <CheckCircleRoundedIcon
                          sx={{ mt: 0.1, color: column.color, fontSize: 19 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "#3f4d62", lineHeight: 1.5 }}
                        >
                          {t(benefitKey)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Paper>

          <Box
            sx={{
              mt: 4,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 1.5,
              maxWidth: 930,
              mx: "auto",
            }}
          >
            {[
              {
                icon: <SecurityOutlinedIcon />,
                title: t("subscription_secure_payment_title"),
                text: t("subscription_secure_payment_text"),
              },
              {
                icon: <PaymentsOutlinedIcon />,
                title: t("subscription_payment_methods_title"),
                text: t("subscription_payment_methods_text"),
              },
              {
                icon: <SupportAgentOutlinedIcon />,
                title: t("subscription_support_title"),
                text: t("subscription_support_text"),
              },
            ].map((item) => (
              <Paper
                key={item.title}
                elevation={0}
                sx={{ p: 2.2, border: "1px solid #dfe6ef", borderRadius: 2.5 }}
              >
                <Box sx={{ color: "#1262db" }}>{item.icon}</Box>
                <Typography sx={{ mt: 0.8, color: "#0a1930", fontWeight: 900 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: "#65738a" }}>
                  {item.text}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>
    </PayPalScriptProvider>
  );
}
