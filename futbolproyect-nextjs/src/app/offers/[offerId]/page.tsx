"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import FeatureOfferPaymentModal from "@/components/FeatureOfferPaymentModal";
import OfferActions from "@/components/OfferActions";
import Image from "next/image";
import ShareButtons from "@/components/ShareButtons";

// --- Función de Fetching para React Query ---
const fetchOffer = async (offerId: string) => {
  const { data } = await apiClient.get(`/offers/${offerId}`);
  return data;
};

// --- Componente Principal ---
export default function OfferDetailPage() {
  const { t, i18n } = useTranslation("common");
  const params = useParams();
  const offerId = params.offerId as string;
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const offerCardRef = useRef(null);

  // 1. Hooks siempre al principio (antes de cualquier return)
  const {
    data: offer,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: () => fetchOffer(offerId),
    enabled: !!user && !!offerId, // Aseguramos que haya user y offerId
  });

  const { mutate: deleteOffer } = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/offers/${id}`),
    onSuccess: () => {
      toast.success(
        t("offer_deleted_successfully", "Oferta eliminada con éxito"),
      );
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      router.push("/all-offers"); // Corregido ruta de retorno
    },
    onError: (err: any) => {
      toast.error(
        err.message || t("offer_delete_error", "Error al eliminar la oferta"),
      );
    },
  });

  // 2. Cálculos seguros (pueden ser undefined si no hay oferta aún)
  const lang = i18n.language;
  // Usamos optional chaining (?.) y valores por defecto para evitar errores cuando 'offer' es null
  const titulo = offer ? offer[`titulo_${lang}`] || offer.titulo : "";
  const descripcion = offer
    ? offer[`descripcion_${lang}`] || offer.descripcion
    : "";
  const ubicacion = offer ? offer[`ubicacion_${lang}`] || offer.ubicacion : "";
  const puesto = offer ? offer[`puesto_${lang}`] || offer.puesto : "";
  const nivel = offer ? offer[`nivel_${lang}`] || offer.nivel : "";
  const horarios = offer ? offer[`horarios_${lang}`] || offer.horarios : "";
  const detalles_adicionales = offer
    ? offer[`detalles_adicionales_${lang}`] || offer.detalles_adicionales
    : "";

  const isOwner = user && offer && user.id === offer.id_usuario_ofertante;
  const isAdmin = user && user.isAdmin;

  // 3. Memoizamos el esquema para evitar recálculos en cada render
  const jobPostingSchema = useMemo(() => {
    if (!offer) return null;
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: titulo,
      description: descripcion,
      identifier: {
        "@type": "PropertyValue",
        name: "FutbolProyect",
        value: offer.id,
      },
      datePosted: offer.fecha_publicacion,
      hiringOrganization: {
        "@type": "Organization",
        name: offer.nombre_ofertante,
        sameAs: "https://futbolproyect.com",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: ubicacion,
        },
      },
      ...(offer.salario && {
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: {
            "@type": "QuantitativeValue",
            value: offer.salario,
            unitText: "MONTH",
          },
        },
      }),
    };
  }, [offer, titulo, descripcion, ubicacion]);

  // 4. useEffect para SEO (Siempre al nivel superior)
  useEffect(() => {
    if (!offer || typeof document === "undefined") return;

    document.title = `${titulo} - FutbolProyect`;
    const metaDescriptionTag = document.querySelector(
      'meta[name="description"]',
    );
    const seoDescriptionContent = descripcion
      ? descripcion.substring(0, 160)
      : "";

    if (metaDescriptionTag) {
      metaDescriptionTag.setAttribute("content", seoDescriptionContent);
    } else {
      const newMetaTag = document.createElement("meta");
      newMetaTag.name = "description";
      newMetaTag.content = seoDescriptionContent;
      document.head.appendChild(newMetaTag);
    }

    // Handle JSON-LD script for SEO
    const existingSchema = document.getElementById("job-posting-schema");
    if (existingSchema) {
      existingSchema.remove();
    }

    if (jobPostingSchema) {
      const script = document.createElement("script");
      script.id = "job-posting-schema";
      script.type = "application/ld+json";
      script.innerHTML = JSON.stringify(jobPostingSchema);
      document.head.appendChild(script);
    }

    return () => {
      const scriptToRemove = document.getElementById("job-posting-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [offer, titulo, descripcion, jobPostingSchema]);

  // --- Funciones auxiliares ---
  const handleOfferAction = (action: string, id: string) => {
    if (action === "edit") {
      router.push(`/offers/edit/${id}`);
    } else if (action === "delete") {
      if (
        window.confirm(
          t("confirm_delete_offer", { title: titulo }) ||
            "¿Estás seguro de que quieres eliminar esta oferta?",
        )
      ) {
        deleteOffer(id);
      }
    }
  };

  const handleOpenPaymentModal = () => setShowPaymentModal(true);
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    queryClient.invalidateQueries({ queryKey: ["offer", offerId] });
  };

  const handleDownload = () => {
    if (offerCardRef.current) {
      setTimeout(() => {
        html2canvas(offerCardRef.current!, { useCORS: true }).then((canvas) => {
          const link = document.createElement("a");
          link.download = `offer-${offerId}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        });
      }, 500);
    }
  };

  // 5. RENDERS CONDICIONALES (Siempre al final)

  if (!user) {
    return (
      <Stack alignItems="center" sx={{ mt: 4 }}>
        <Alert severity="warning">
          {t(
            "must_be_logged_in_to_see_offer",
            "Debes iniciar sesión para ver los detalles de la oferta.",
          )}
        </Alert>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          {t("loading_offer", "Cargando oferta...")}
        </Typography>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.message || t("offer_not_found", "Oferta no encontrada.")}
      </Alert>
    );
  }

  if (!offer) {
    return (
      <Alert severity="warning">
        {t("offer_not_found", "Oferta no encontrada.")}
      </Alert>
    );
  }

  return (
    <Stack alignItems="center" sx={{ mt: 4 }}>
      <Card
        ref={offerCardRef}
        sx={{ maxWidth: 800, width: "100%" }}
        elevation={3}
      >
        {offer.imagen_url && (
          <Image
            src={offer.imagen_url}
            alt={titulo}
            width={711}
            height={400}
            style={{
              width: "100%",
              objectFit: "contain",
            }}
          />
        )}
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>
            {titulo}
          </Typography>

          <Typography>
            <strong>{t("published_by", "Publicado por")}:</strong>{" "}
            {offer.nombre_ofertante}
          </Typography>
          <Typography>
            <strong>{t("location", "Ubicación")}:</strong>{" "}
            {ubicacion || t("not_specified", "No especificada")}
          </Typography>
          <Typography>
            <strong>{t("position", "Puesto")}:</strong>{" "}
            {puesto || t("not_specified", "No especificado")}
          </Typography>
          <Typography>
            <strong>{t("salary", "Salario")}:</strong>{" "}
            {offer.salario || t("not_specified", "No especificado")}
          </Typography>
          <Typography>
            <strong>{t("level", "Nivel")}:</strong>{" "}
            {nivel || t("not_specified", "No especificado")}
          </Typography>
          <Typography>
            <strong>{t("schedule", "Horarios")}:</strong>{" "}
            {horarios || t("not_specified", "No especificado")}
          </Typography>
          <Typography>
            <strong>{t("publication_date", "Fecha de Publicación")}:</strong>{" "}
            {new Date(offer.fecha_publicacion).toLocaleDateString()}
          </Typography>
          <Typography sx={{ mt: 2 }}>
            <strong>{t("description", "Descripción")}:</strong> {descripcion}
          </Typography>
          {detalles_adicionales && (
            <Stack sx={{ mt: 2 }}>
              <Typography variant="h6">
                {t("additional_details_title", "Detalles Adicionales")}
              </Typography>
              <Typography>{detalles_adicionales}</Typography>
            </Stack>
          )}

          {/* --- Botones de Acción --- */}
          <Stack alignItems="center" sx={{ mt: 3 }} spacing={2}>
            {(isOwner || isAdmin) && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpenPaymentModal}
              >
                {t("feature_offer_button", "Destacar Oferta ($10 USD)")}
              </Button>
            )}

            <OfferActions
              offer={offer}
              onOfferAction={handleOfferAction}
              isFetching={isLoading}
            />
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
        <ShareButtons
          title={titulo}
          url={typeof window !== "undefined" ? window.location.href : ""}
          onDownload={handleDownload}
        />
      </Stack>
    </Stack>
  );
}
