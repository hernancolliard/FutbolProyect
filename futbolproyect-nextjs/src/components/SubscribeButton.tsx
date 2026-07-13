"use client";

import React, { useRef, useState } from "react";
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

type PayPalClientEvent =
  | "APPROVED"
  | "CANCELLED"
  | "SDK_ERROR"
  | "CLIENT_CAPTURE_ERROR";

interface PayPalEventDetails {
  httpStatus?: number;
  errorName?: string;
  errorMessage?: string;
  fundingSource?: string;
}

function SubscribeButton({
  planType,
  billingCycle,
}: SubscribeButtonProps) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [paypalProcessing, setPaypalProcessing] = useState(false);
  const lastPayPalOrderId = useRef("");
  const trackingTokens = useRef<Record<string, string>>({});

  const reportPayPalEvent = async (
    event: PayPalClientEvent,
    orderID: string,
    details: PayPalEventDetails = {},
  ) => {
    const trackingToken = trackingTokens.current[orderID];
    if (!orderID || !trackingToken) return;

    try {
      await apiClient.post("/payments/paypal-checkout-event", {
        trackingToken,
        event,
        details,
      });
    } catch (telemetryError) {
      // La telemetría nunca debe impedir que el usuario complete el pago.
      console.error("Could not report PayPal checkout event:", telemetryError);
    }
  };

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
    setError("");
    setInfo("");
    try {
      const response = await apiClient.post("/payments/create-paypal-order", {
        planType,
        billingCycle,
      });
      const orderID = String(response.data.orderID || "");
      const trackingToken = String(response.data.trackingToken || "");
      lastPayPalOrderId.current = orderID;
      if (orderID && trackingToken) {
        trackingTokens.current[orderID] = trackingToken;
      }
      return orderID;
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
    setPaypalProcessing(true);
    setError("");
    setInfo(
      t(
        "paypal_payment_approved_processing",
        "Pago aprobado. Estamos confirmando la operación...",
      ),
    );
    await reportPayPalEvent("APPROVED", data.orderID);

    try {
      await apiClient.post("/payments/capture-paypal-order", {
        orderID: data.orderID,
        planType,
        billingCycle,
      });
      router.push("/payment/success/paypal"); // Use router.push
    } catch (captureError: any) {
      const httpStatus = Number(captureError?.response?.status) || undefined;
      const errorMessage = String(
        captureError?.response?.data?.message || captureError?.message || "",
      );
      await reportPayPalEvent("CLIENT_CAPTURE_ERROR", data.orderID, {
        httpStatus,
        errorName: httpStatus ? `HTTP_${httpStatus}` : "CAPTURE_REQUEST_ERROR",
        errorMessage,
      });
      console.error("Error capturing PayPal order:", captureError);
      setInfo("");
      setError(
        httpStatus === 401
          ? t(
              "paypal_session_expired",
              "Tu sesión venció mientras pagabas. El intento quedó registrado; inicia sesión nuevamente o contáctanos antes de repetir el pago.",
            )
          : t(
              "paypal_capture_error",
              "PayPal aprobó la operación, pero no pudimos confirmarla. No repitas el pago hasta verificar el estado o contactar a soporte.",
            ),
      );
    } finally {
      setPaypalProcessing(false);
    }
  };

  const onCancel = (data: Record<string, unknown>) => {
    const orderID = String(data.orderID || lastPayPalOrderId.current || "");
    void reportPayPalEvent("CANCELLED", orderID, {
      fundingSource: String(data.fundingSource || ""),
    });
    setError("");
    setInfo(
      t(
        "paypal_cancelled_by_user",
        "Cancelaste el pago en PayPal. No se realizó ningún cobro.",
      ),
    );
  };

  const onError = (paypalError: Record<string, unknown>) => {
    const orderID = lastPayPalOrderId.current;
    const errorMessage = String(paypalError.message || "PayPal SDK error");
    void reportPayPalEvent("SDK_ERROR", orderID, {
      errorName: String(paypalError.name || "SDK_ERROR"),
      errorMessage,
    });
    console.error("PayPal checkout error:", paypalError);
    setInfo("");
    setError((currentError) =>
      currentError ||
      t(
        "paypal_sdk_error",
        "PayPal tuvo un inconveniente antes de completar el pago. Intenta nuevamente o contacta a soporte.",
      ),
    );
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {info && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {info}
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
          onCancel={onCancel}
          onError={onError}
          disabled={paypalProcessing}
        />
      </Box>
    </Box>
  );
}

export default SubscribeButton;
