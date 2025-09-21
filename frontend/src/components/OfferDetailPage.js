import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import FeatureOfferPaymentModal from "./FeatureOfferPaymentModal";
import OfferActions from "./OfferActions"; // Importar el componente centralizado
import OptimizedImage from "./OptimizedImage";

// --- Función de Fetching para React Query ---
const fetchOffer = async (offerId) => {
  const { data } = await apiClient.get(`/offers/${offerId}`);
  return data;
};

// --- Componente Principal ---
function OfferDetailPage() {
  const { t, i18n } = useTranslation();
  const { offerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Query para obtener los datos de la oferta
  const { data: offer, isLoading, isError, error } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: () => fetchOffer(offerId),
  });

  const { mutate: deleteOffer } = useMutation({
    mutationFn: (id) => apiClient.delete(`/offers/${id}`),
    onSuccess: () => {
      toast.success(t("offer_deleted_successfully", "Oferta eliminada con éxito"));
      queryClient.invalidateQueries(['offers']);
      navigate('/offers');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t("offer_delete_error", "Error al eliminar la oferta"));
    },
  });

  const handleOfferAction = (action, id) => {
    if (action === 'edit') {
      navigate(`/edit-offer/${id}`);
    } else if (action === 'delete') {
      if (window.confirm(t('are_you_sure_delete_offer', '¿Estás seguro de que quieres eliminar esta oferta?'))) {
        deleteOffer(id);
      }
    }
  };

  // --- Manejadores de Modal de Pago ---
  const handleOpenPaymentModal = () => setShowPaymentModal(true);
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    queryClient.invalidateQueries({ queryKey: ["offer", offerId] });
  };

  // --- Renderizado condicional ---
  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t("loading_offer")}</Typography>
      </Stack>
    );
  }

  if (isError) {
    return <Alert severity="error">{error.message || t("offer_not_found")}</Alert>;
  }

  if (!offer) {
    return <Alert severity="warning">{t("offer_not_found")}</Alert>;
  }

  const isOwner = user && user.id === offer.id_usuario_ofertante;
  const isAdmin = user && user.isAdmin;

  const lang = i18n.language;
  const titulo = offer[`titulo_${lang}`] || offer.titulo;
  const descripcion = offer[`descripcion_${lang}`] || offer.descripcion;
  const ubicacion = offer[`ubicacion_${lang}`] || offer.ubicacion;
  const puesto = offer[`puesto_${lang}`] || offer.puesto;
  const nivel = offer[`nivel_${lang}`] || offer.nivel;
  const horarios = offer[`horarios_${lang}`] || offer.horarios;
  const detalles_adicionales = offer[`detalles_adicionales_${lang}`] || offer.detalles_adicionales;

  return (
    <Stack alignItems="center" sx={{ mt: 4 }}>
      <Card sx={{ maxWidth: 800, width: "100%" }} elevation={3} className="offer-detail-page">
        {offer.imagen_url && (
          <OptimizedImage
            src={offer.imagen_url}
            alt={titulo}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "400px",
              objectFit: "cover",
            }}
          />
        )}
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>{titulo}</Typography>
          
          {/* ... (resto del contenido de la tarjeta) ... */}
          <Typography><strong>{t("published_by")}</strong> {offer.nombre_ofertante}</Typography>
          <Typography><strong>{t("location")}</strong> {ubicacion || t("not_specified")}</Typography>
          <Typography><strong>{t("position")}</strong> {puesto || t("not_specified")}</Typography>
          <Typography><strong>{t("salary")}</strong> {offer.salario || t("not_specified")}</Typography>
          <Typography><strong>{t("level")}</strong> {nivel || t("not_specified")}</Typography>
          <Typography><strong>{t("schedule")}</strong> {horarios || t("not_specified")}</Typography>
          <Typography><strong>{t("publication_date")}</strong> {new Date(offer.fecha_publicacion).toLocaleDateString()}</Typography>
          <Typography sx={{ mt: 2 }}><strong>{t("description")}</strong> {descripcion}</Typography>
          {detalles_adicionales && (
            <Stack sx={{ mt: 2 }}>
              <Typography variant="h6">{t("additional_details_title")}</Typography>
              <Typography>{detalles_adicionales}</Typography>
            </Stack>
          )}

          {/* --- Botones de Acción --- */}
          <Stack alignItems="center" sx={{ mt: 3 }} spacing={2}>
            {(isOwner || isAdmin) && (
              <Button variant="contained" color="secondary" onClick={handleOpenPaymentModal}>
                Destacar Oferta ($10 USD)
              </Button>
            )}
            
            {/* Renderizamos el componente de acciones que ahora contiene la lógica de postulación */}
            <OfferActions offer={offer} onOfferAction={handleOfferAction} isFetching={isLoading} />

          </Stack>
        </CardContent>
      </Card>
      {showPaymentModal && (
        <FeatureOfferPaymentModal
          show={showPaymentModal}
          onClose={handleClosePaymentModal}
          offerId={offerId}
        />
      )}
    </Stack>
  );
}

export default OfferDetailPage;