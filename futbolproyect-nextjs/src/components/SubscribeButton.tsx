"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

interface SubscribeButtonProps {
  planType: string;
  billingCycle: string;
}

function SubscribeButton({
  planType,
  billingCycle,
}: SubscribeButtonProps) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribeMP = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/payments/create-preference-mp", {
        planType,
        billingCycle,
      });
      window.open(response.data.init_point, "_blank");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setError(
          t(
            "must_be_logged_in_to_subscribe",
            "Debes iniciar sesión para suscribirte.",
          ),
        );
      } else {
        console.error("Error al crear la preferencia de MP:", error);
        setError(
          error.message ||
            t(
              "payment_error_mp",
              "Error al iniciar el proceso de pago con Mercado Pago.",
            ),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    try {
      const response = await apiClient.post("/payments/create-paypal-order", {
        planType,
        billingCycle,
      });
      return response.data.orderID;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setError(
          t(
            "must_be_logged_in_to_subscribe",
            "Debes iniciar sesión para suscribirte.",
          ),
        );
      } else {
        console.error("Error creating PayPal order:", error);
        setError(
          t(
            "payment_error_paypal_generic",
            "No se pudo iniciar el pago con PayPal. Por favor, intenta de nuevo.",
          ),
        );
      }
      throw error;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      await apiClient.post("/payments/capture-paypal-order", {
        orderID: data.orderID,
        planType,
        billingCycle,
      });
      router.push("/payment/success/paypal"); // Use router.push
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
      router.push("/payment/cancelled/paypal"); // Use router.push
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubscribeMP}
        disabled={loading}
        sx={{
          width: "100%",
          py: 1.2,
          bgcolor: "#1262db",
          fontWeight: 900,
          "&:hover": { bgcolor: "#0d4faf" },
        }}
      >
        {loading ? <CircularProgress size={24} /> : "Suscribirme con Mercado Pago"}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" sx={{ color: "#758196" }}>
          o pagar con
        </Typography>
      </Divider>

      <Box sx={{ width: "100%", minWidth: 0 }}>
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", height: 44 }}
          createOrder={createOrder}
          onApprove={onApprove}
        />
      </Box>
    </Box>
  );
}

export default SubscribeButton;
