'use client';

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useParams and useRouter from next/navigation
import apiClient from "@/lib/apiClient"; // Centralized apiClient
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext"; // Migrated AuthContext
import { toast } from "react-toastify";
// import { Helmet } from "react-helmet-async"; // Replaced by Next.js metadata
import html2canvas from "html2canvas"; // html2canvas for screenshot

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import FeatureOfferPaymentModal from "@/components/FeatureOfferPaymentModal"; // Migrated FeatureOfferPaymentModal
import OfferActions from "@/components/OfferActions"; // Migrated OfferActions
import Image from "next/image"; // Replaced OptimizedImage
import ShareButtons from "@/components/ShareButtons"; // Migrated ShareButtons

// --- Función de Fetching para React Query ---
const fetchOffer = async (offerId) => {
  const { data } = await apiClient.get(`/offers/${offerId}`);
  return data;
};

// --- Componente Principal ---
export default function OfferDetailPage() {
  const { t, i18n } = useTranslation('common');
  const params = useParams();
  const offerId = params.offerId; // Get offerId from Next.js useParams
  const { user } = useAuth();
  const router = useRouter(); // Initialize useRouter
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const offerCardRef = useRef(null);

  // Query para obtener los datos de la oferta
  const { data: offer, isLoading, isError, error } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: () => fetchOffer(offerId),
    enabled: !!user, // Solo ejecutar la consulta si el usuario está logueado
  });

  const { mutate: deleteOffer } = useMutation({
    mutationFn: (id) => apiClient.delete(`/offers/${id}`),
    onSuccess: () => {
      toast.success(t("offer_deleted_successfully", "Oferta eliminada con éxito"));
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      router.push('/offers'); // Use router.push
    },
    onError: (err) => {
      toast.error(err.message || t("offer_delete_error", "Error al eliminar la oferta"));
    },
  });

  const handleOfferAction = (action, id) => {
    if (action === 'edit') {
      router.push(`/offers/edit/${id}`); // Use router.push
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

  const handleDownload = () => {
    if (offerCardRef.current) {
      setTimeout(() => {
        html2canvas(offerCardRef.current, { useCORS: true }).then(canvas => {
          const link = document.createElement('a');
          link.download = `offer-${offerId}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
      }, 500); // Small delay to ensure image is loaded
    }
  };

  // Removed useEffect for window.prerenderReady as it's not typically needed in Next.js


  // --- Renderizado condicional ---
  if (!user) {
    return (
      <Stack alignItems="center" sx={{ mt: 4 }}>
        <Alert severity="warning">{t("must_be_logged_in_to_see_offer", "Debes iniciar sesión para ver los detalles de la oferta.")}</Alert>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t("loading_offer", "Cargando oferta...")}</Typography>
      </Stack>
    );
  }

  if (isError) {
    return <Alert severity="error">{error.message || t("offer_not_found", "Oferta no encontrada.")}</Alert>;
  }

  if (!offer) {
    return <Alert severity="warning">{t("offer_not_found", "Oferta no encontrada.")}</Alert>;
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

  // Estructura de datos para el Rich Snippet de Google Jobs
  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": titulo,
    "description": descripcion,
    "identifier": {
      "@type": "PropertyValue",
      "name": "FutbolProyect",
      "value": offer.id
    },
    "datePosted": offer.fecha_publicacion,
    "hiringOrganization": {
      "@type": "Organization",
      "name": offer.nombre_ofertante,
      "sameAs": "https://futbolproyect.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": ubicacion
      }
    },
    ...(offer.salario && {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "USD", // Asumimos USD, se puede ajustar si hay un campo de moneda
        "value": {
          "@type": "QuantitativeValue",
          "value": offer.salario,
          "unitText": "MONTH" // Asumimos mensual, se puede ajustar
        }
      }
    })
  };

  // For dynamic metadata in client components, you would typically update document.title and meta tags directly in useEffect
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${titulo} - FutbolProyect`;
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      const seoDescriptionContent = descripcion ? descripcion.substring(0, 160) : '';
      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute('content', seoDescriptionContent);
      } else {
        const newMetaTag = document.createElement('meta');
        newMetaTag.name = 'description';
        newMetaTag.content = seoDescriptionContent;
        document.head.appendChild(newMetaTag);
      }

      // Handle JSON-LD script for SEO
      const existingSchema = document.getElementById('job-posting-schema');
      if (existingSchema) {
        existingSchema.remove();
      }
      const script = document.createElement('script');
      script.id = 'job-posting-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(jobPostingSchema);
      document.head.appendChild(script);

      return () => {
        // Clean up script on unmount
        const scriptToRemove = document.getElementById('job-posting-schema');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [titulo, descripcion, jobPostingSchema]); // Depend on relevant data


  return (
    <Stack alignItems="center" sx={{ mt: 4 }}>
      <Card ref={offerCardRef} sx={{ maxWidth: 800, width: "100%" }} elevation={3}> {/* Removed offer-detail-page class */}
        {offer.imagen_url && (
            <Image
              src={offer.imagen_url}
              alt={titulo}
              width={711} // Example width
              height={400} // Example height
              style={{
                width: "100%",
                objectFit: "contain",
              }}
            />
        )}
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>{titulo}</Typography>
          
          <Typography><strong>{t("published_by", "Publicado por")}:</strong> {offer.nombre_ofertante}</Typography>
          <Typography><strong>{t("location", "Ubicación")}:</strong> {ubicacion || t("not_specified", "No especificada")}</Typography>
          <Typography><strong>{t("position", "Puesto")}:</strong> {puesto || t("not_specified", "No especificado")}</Typography>
          <Typography><strong>{t("salary", "Salario")}:</strong> {offer.salario || t("not_specified", "No especificado")}</Typography>
          <Typography><strong>{t("level", "Nivel")}:</strong> {nivel || t("not_specified", "No especificado")}</Typography>
          <Typography><strong>{t("schedule", "Horarios")}:</strong> {horarios || t("not_specified", "No especificado")}</Typography>
          <Typography><strong>{t("publication_date", "Fecha de Publicación")}:</strong> {new Date(offer.fecha_publicacion).toLocaleDateString()}</Typography>
          <Typography sx={{ mt: 2 }}><strong>{t("description", "Descripción")}:</strong> {descripcion}</Typography>
          {detalles_adicionales && (
            <Stack sx={{ mt: 2 }}>
              <Typography variant="h6">{t("additional_details_title", "Detalles Adicionales")}</Typography>
              <Typography>{detalles_adicionales}</Typography>
            </Stack>
          )}

          {/* --- Botones de Acción --- */}
          <Stack alignItems="center" sx={{ mt: 3 }} spacing={2}>
            {(isOwner || isAdmin) && (
              <Button variant="contained" color="secondary" onClick={handleOpenPaymentModal}>
                {t("feature_offer_button", "Destacar Oferta ($10 USD)")}
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
      <Stack alignItems="center" sx={{ mt: 2, mb: 4 }}>
        <ShareButtons title={titulo} url={typeof window !== 'undefined' ? window.location.href : ''} onDownload={handleDownload} />
      </Stack>
    </Stack>
  );
}
