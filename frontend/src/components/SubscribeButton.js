import React, { useEffect, useRef } from "react";
import apiClient from "../services/api";
import { toast } from 'react-toastify';

function SubscribeButton({ planType, billingCycle, children }) {
  const paypalButtonRef = useRef();

  const handleMercadoPagoSubscribe = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión para suscribirte.");
        return;
      }

      const response = await apiClient.post("/payments/create-preference-mp", {
        planType,
        billingCycle,
      });
      window.open(response.data.init_point, "_blank");
    } catch (error) {
      console.error("Error al suscribirse con Mercado Pago:", error);
      toast.error(
        error.response?.data?.message ||
          "Hubo un error al procesar la suscripción con Mercado Pago."
      );
    }
  };

  useEffect(() => {
    if (
      window.paypal &&
      paypalButtonRef.current &&
      paypalButtonRef.current.innerHTML === ""
    ) {
      window.paypal
        .Buttons({
          createOrder: async (data, actions) => {
            try {
              const response = await apiClient.post(
                "/payments/create-paypal-order",
                { planType, billingCycle }
              );
              return response.data.orderID;
            } catch (error) {
              console.error("Error al crear la orden de PayPal:", error);
              toast.error("Hubo un error al crear la orden de PayPal.");
              return null;
            }
          },
          onApprove: async (data, actions) => {
            try {
              const response = await apiClient.post(
                "/payments/capture-paypal-order",
                { orderID: data.orderID, planType, billingCycle }
              );
              if (response.data.success) {
                toast.success("¡Pago de PayPal exitoso!");
                window.location.href = "/pago-exitoso-paypal";
              } else {
                toast.error("El pago de PayPal no se completó.");
                window.location.href = "/pago-cancelado-paypal";
              }
            } catch (error) {
              console.error("Error al capturar el pago de PayPal:", error);
              toast.error("Hubo un error al capturar el pago de PayPal.");
              window.location.href = "/pago-cancelado-paypal";
            }
          },
          onError: (err) => {
            console.error("Error en el botón de PayPal:", err);
            toast.error(
              "Ocurrió un error con PayPal. Por favor, inténtalo de nuevo."
            );
          },
        })
        .render(paypalButtonRef.current);
    }
  }, [planType, billingCycle]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <button
        className="subscribe-button"
        onClick={handleMercadoPagoSubscribe}
        style={{ width: "200px", height: "35px" }}
      >
        {children} Mercado Pago
      </button>
      <div ref={paypalButtonRef}></div>
    </div>
  );
}

export default SubscribeButton;