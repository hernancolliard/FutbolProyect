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
    title: "Plan para clubes y agencias",
    subtitle: "Encontrá el talento que tu proyecto necesita.",
    icon: <BusinessOutlinedIcon />,
    benefits: [
      "Publicar y gestionar ofertas desde tu perfil",
      "Recibir postulaciones con información deportiva",
      "Acceder a perfiles y material profesional",
      "Destacar oportunidades para ganar visibilidad",
    ],
  },
  {
    type: "postulante",
    title: "Plan para profesionales",
    subtitle: "Mostrá tu talento y accedé a nuevas oportunidades.",
    icon: <PersonSearchOutlinedIcon />,
    benefits: [
      "Postularte a ofertas abiertas",
      "Mostrar CV, fotos, videos y enlaces deportivos",
      "Compartir tu perfil profesional",
      "Conectar con clubes, agencias y proyectos",
    ],
  },
];

export default function SubscriptionPage() {
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
    document.title = "Planes de Suscripción | FutbolProyect";
    const description =
      "Elegí el plan de FutbolProyect para publicar ofertas, buscar talento o postularte a oportunidades deportivas.";
    let metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
  }, []);

  const selectedPlan = plans.find((plan) => plan.plan_name === billingCycle);
  const price = selectedPlan?.price_usd;
  const formattedPrice =
    price !== undefined && price !== null && price !== ""
      ? `U$D ${price}`
      : "Consultar";

  if (isLoading) {
    return <LoadingSpinner text="Cargando planes..." />;
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          {error.message || "Error al cargar los planes de suscripción."}
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
              "linear-gradient(90deg, rgba(2, 15, 37, .98), rgba(3, 31, 70, .9)), url('/images/fondo_1_lowres.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center 58%",
          }}
        >
          <Container maxWidth="lg" sx={{ textAlign: "center" }}>
            <Chip
              icon={<SportsSoccerOutlinedIcon />}
              label="Invertí en tu próximo paso"
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
              Planes para crecer dentro del{" "}
              <Box component="span" sx={{ color: "#2f80ff" }}>
                fútbol
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
              Elegí la modalidad que mejor se adapta a tu perfil y accedé a las
              herramientas de FutbolProyect.
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
              aria-label="Ciclo de facturación"
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
              <ToggleButton value="monthly">Mensual</ToggleButton>
              <ToggleButton value="annual">Anual</ToggleButton>
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
                        {plan.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.3, color: "#65738a" }}>
                        {plan.subtitle}
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
                    {formattedPrice !== "Consultar" && (
                      <Typography sx={{ pb: 0.3, color: "#758196" }}>
                        /{billingCycle === "monthly" ? "mes" : "año"}
                      </Typography>
                    )}
                  </Stack>

                  <Stack spacing={1.3} sx={{ my: 3 }}>
                    {plan.benefits.map((benefit) => (
                      <Stack key={benefit} direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleRoundedIcon sx={{ mt: 0.1, color: "#1262db", fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: "#3f4d62", lineHeight: 1.55 }}>
                          {benefit}
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
                title: "Pago protegido",
                text: "Procesado mediante proveedores de pago integrados.",
              },
              {
                icon: <PaymentsOutlinedIcon />,
                title: "Dos medios de pago",
                text: "Mercado Pago y PayPal disponibles.",
              },
              {
                icon: <SupportAgentOutlinedIcon />,
                title: "Soporte",
                text: "Canal de contacto para ayudarte durante el proceso.",
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
