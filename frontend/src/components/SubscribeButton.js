import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

function SubscribeButton({ planType, billingCycle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      window.location.href = response.data.init_point;
    } catch (error) {
      // --- INICIO DE LA MODIFICACIÓN ---
      if (error.response && error.response.status === 401) {
        setError(t("must_be_logged_in_to_subscribe"));
      } else {
        console.error("Error al crear la preferencia de MP:", error);
        setError(
          error.response?.data?.message ||
            "Error al iniciar el proceso de pago."
        );
      }
      // --- FIN DE LA MODIFICACIÓN ---
    } finally {
      setLoading(false);
    }
  };

  // --- Reemplaza la función createOrder con esta ---
  const createOrder = async (data, actions) => {
    try {
      const response = await apiClient.post("/payments/create-order-paypal", {
        planType,
        billingCycle,
      });
      // Si todo va bien, devolvemos el ID de la orden.
      return response.data.id;
    } catch (error) {
      // Si hay un error al llamar a nuestro backend...
      if (error.response && error.response.status === 401) {
        alert(t("must_be_logged_in_to_subscribe"));
      } else {
        console.error("Error creating PayPal order:", error);
        // Mostramos un mensaje genérico al usuario.
        alert(
          "No se pudo iniciar el pago con PayPal. Por favor, intenta de nuevo."
        );
      }
      // ¡Esta es la línea clave! Le informamos a PayPal que la creación de la orden falló.
      throw error;
    }
  };

  const onApprove = async (data, actions) => {
    try {
      await apiClient.post("/payments/capture-order-paypal", {
        orderID: data.orderID,
        planType,
        billingCycle,
      });
      navigate("/pago-exitoso-paypal");
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
      navigate("/pago-cancelado-paypal");
    }
  };

  return (
    <div>
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
          "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
          currency: "USD",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={createOrder}
          onApprove={onApprove}
        />
      </PayPalScriptProvider>
    </div>
  );
}

export default SubscribeButton;
