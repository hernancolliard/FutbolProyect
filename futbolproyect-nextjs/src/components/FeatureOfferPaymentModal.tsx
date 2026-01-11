'use client';

import React, { useState } from "react";
import Modal from "./ui/Modal"; // Migrated Modal
import apiClient from "../../lib/apiClient"; // Centralized apiClient
import { useTranslation } from "react-i18next";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

function FeatureOfferPaymentModal({ show, onClose, offerId }) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMercadoPagoPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/payments/create-preference-mp", {
        planType: "destacar_oferta",
        offerId: offerId,
      });
      if (response.data && response.data.init_point) {
        window.open(response.data.init_point, "_blank");
      } else {
        setError(t("payment_error_mp", "Error al procesar el pago con Mercado Pago."));
      }
    } catch (err) {
      console.error("Error creating Mercado Pago preference:", err);
      setError(err.message || t("payment_error_mp", "Error al procesar el pago con Mercado Pago."));
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/payments/create-paypal-order", {
        planType: "destacar_oferta",
        offerId: offerId,
      });
      if (response.data && response.data.orderID) {
        const approvalUrl = response.data.links.find(
          (link) => link.rel === "approve"
        ).href;
        window.open(approvalUrl, "_blank");
      } else {
        setError(t("payment_error_paypal", "Error al procesar el pago con PayPal."));
      }
    } catch (err) {
      console.error("Error creating PayPal order:", err);
      setError(err.message || t("payment_error_paypal", "Error al procesar el pago con PayPal."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={show} onClose={onClose}>
      <Stack spacing={3} alignItems="center" sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6">{t("feature_offer_payment_title", "Destacar Oferta")}</Typography>
        <Typography variant="body1">
          {t("feature_offer_payment_description", "Selecciona tu método de pago para destacar esta oferta.")}
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          className="payment-options"
        >
          <Button
            onClick={handleMercadoPagoPayment}
            disabled={loading}
            variant="contained"
            color="primary"
          >
            {loading ? t("processing_payment", "Procesando pago...") : t("pay_with_mercadopago", "Pagar con Mercado Pago")}
          </Button>
          <Button
            onClick={handlePayPalPayment}
            disabled={loading}
            variant="contained"
            color="secondary"
          >
            {loading ? t("processing_payment", "Procesando pago...") : t("pay_with_paypal", "Pagar con PayPal")}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}

export default FeatureOfferPaymentModal;
