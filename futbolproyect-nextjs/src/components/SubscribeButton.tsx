'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { useAuth } from "@/context/AuthContext"; // Migrated AuthContext
import apiClient from "@/lib/apiClient"; // Centralized apiClient
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

function SubscribeButton({ planType, billingCycle }) {
  const { user } = useAuth();
  const router = useRouter(); // Initialize useRouter
  const { t } = useTranslation('common');
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
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError(t("must_be_logged_in_to_subscribe", "Debes iniciar sesión para suscribirte."));
      } else {
        console.error("Error al crear la preferencia de MP:", error);
        setError(
          error.message ||
            t("payment_error_mp", "Error al iniciar el proceso de pago con Mercado Pago.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data, actions) => {
    try {
      const response = await apiClient.post("/payments/create-paypal-order", {
        planType,
        billingCycle,
      });
      return response.data.orderID;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError(t("must_be_logged_in_to_subscribe", "Debes iniciar sesión para suscribirte."));
      } else {
        console.error("Error creating PayPal order:", error);
        setError(
          t("payment_error_paypal_generic", "No se pudo iniciar el pago con PayPal. Por favor, intenta de nuevo.")
        );
      }
      throw new Error(error);
    }
  };

  const onApprove = async (data, actions) => {
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
    <Box>
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
        sx={{ mb: 2, width: "100%" }}
      >
        {loading ? <CircularProgress size={24} /> : "Mercado Pago"}
      </Button>

      <PayPalScriptProvider
        options={{
          "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "YOUR_PAYPAL_CLIENT_ID", // Use NEXT_PUBLIC prefix
          currency: "USD",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={createOrder}
          onApprove={onApprove}
        />
      </PayPalScriptProvider>
    </Box>
  );
}

export default SubscribeButton;
