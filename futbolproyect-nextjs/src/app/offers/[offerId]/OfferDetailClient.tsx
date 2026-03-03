"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import Box from "@mui/material/Box";

import FeatureOfferPaymentModal from "@/components/FeatureOfferPaymentModal";
import OfferActions from "@/components/shared/OfferActions";

import Image from "next/image";
import ShareButtons from "@/components/ShareButtons";

/* =========================
   TIPOS
========================= */
type OfferDetailClientProps = {
  offerId: string;
};

/* =========================
   FETCH
========================= */
const fetchOffer = async (offerId: string) => {
  const { data } = await apiClient.get(`/offers/${offerId}`);
  return data;
};

/* =========================
   COMPONENTE
========================= */
export default function OfferDetailClient({ offerId }: OfferDetailClientProps) {
  const { t, i18n } = useTranslation("common");
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const offerCardRef = useRef<HTMLDivElement | null>(null);

  const {
    data: offer,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: () => fetchOffer(offerId),
    enabled: !!offerId,
  });

  const { mutate: deleteOffer } = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/offers/${id}`),
    onSuccess: () => {
      toast.success(
        t("offer_deleted_successfully", "Oferta eliminada con éxito"),
      );
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      router.push("/all-offers");
    },
    onError: (err: any) => {
      toast.error(
        err?.message || t("offer_delete_error", "Error al eliminar la oferta"),
      );
    },
  });

  /* =========================
     DATOS SEGUROS
  ========================= */
  const lang = i18n.language;

  const titulo = offer?.[`titulo_${lang}`] || offer?.titulo || "";
  const descripcion =
    offer?.[`descripcion_${lang}`] || offer?.descripcion || "";
  const ubicacion = offer?.[`ubicacion_${lang}`] || offer?.ubicacion || "";
  const puesto = offer?.[`puesto_${lang}`] || offer?.puesto || "";
  const nivel = offer?.[`nivel_${lang}`] || offer?.nivel || "";
  const horarios = offer?.[`horarios_${lang}`] || offer?.horarios || "";
  const detalles_adicionales =
    offer?.[`detalles_adicionales_${lang}`] ||
    offer?.detalles_adicionales ||
    "";

  const isOwner = user && offer && user.id === offer.id_usuario_ofertante;
  const isAdmin = user?.isAdmin;

  /* =========================
     SEO JSON-LD
  ========================= */
  const jobPostingSchema = useMemo(() => {
    if (!offer) return null;

    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: titulo,
      description: descripcion,
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
    };
  }, [offer, titulo, descripcion, ubicacion]);

  useEffect(() => {
    if (!jobPostingSchema) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "job-posting-schema";
    script.innerHTML = JSON.stringify(jobPostingSchema);

    document.head.appendChild(script);

    return () => {
      document.getElementById("job-posting-schema")?.remove();
    };
  }, [jobPostingSchema]);

  /* =========================
     HANDLERS
  ========================= */
  const handleOfferAction = (action: string, id: string) => {
    if (action === "edit") router.push(`/offers/edit/${id}`);
    if (action === "delete" && window.confirm("¿Eliminar esta oferta?")) {
      deleteOffer(id);
    }
  };

  const [applied, setApplied] = useState(false);

  const handleDownload = () => {
    if (!offerCardRef.current) return;

    html2canvas(offerCardRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.download = `offer-${offerId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  /* =========================
     APPLY MUTATION
  ========================= */
  const {
    mutate: applyToOffer,
    isLoading: isApplying,
  } = useMutation({
    mutationFn: () => apiClient.post(`/applications`, { id_oferta: offerId }),
    onSuccess: () => {
      setApplied(true);
      toast.success(
        t("apply_success", "¡Postulación exitosa!"),
      );
    },
    onError: (err: any) => {
      // if backend sends message in response.data
      const msg =
        err?.response?.data?.message ||
        t("apply_error_generic", "Ocurrió un error al postular.");
      toast.error(msg);
    },
  });

  const handleApply = () => {
    applyToOffer();
  };

  /* =========================
     RENDER
  ========================= */
  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">{error?.message}</Alert>;
  if (!offer) return <Alert severity="info">Oferta no encontrada</Alert>;

  return (
    <Stack alignItems="center" sx={{ mt: 4 }}>
      {/* show info to visitors that login is required to apply */}
      {!user && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t("must_be_logged_in_to_see_offer")}
        </Alert>
      )}

      <Card ref={offerCardRef} sx={{ maxWidth: 800, width: "100%" }}>
        {offer.imagen_url && (
          <Image src={offer.imagen_url} alt={titulo} width={800} height={400} />
        )}

        <CardContent>
          <Typography variant="h4">{titulo}</Typography>
          <Typography>{descripcion}</Typography>

          <Stack spacing={2} sx={{ mt: 3 }}>
            {(isOwner || isAdmin) && (
              <Button onClick={() => setShowPaymentModal(true)}>
                Destacar oferta
              </Button>
            )}

            <OfferActions
              offer={offer}
              onOfferAction={handleOfferAction}
              isFetching={isLoading}
            />

            {/* apply button / subscription warning for eligible users */}
            {user?.tipo_usuario === 'postulante' && !isOwner && !isAdmin && (
              <Box sx={{ mt: 2 }}>
                {user.subscription_status === "activa" && !applied ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApply}
                    disabled={isApplying}
                  >
                    {isApplying
                      ? t("applying", "Postulando...")
                      : t("apply", "Postularme")}
                  </Button>
                ) : user.subscription_status === "activa" && applied ? (
                  <Typography color="success.main">
                    {t("apply_success", "¡Postulación exitosa!")}
                  </Typography>
                ) : (
                  <Alert severity="warning">
                    {t(
                      "subscription_plans_subtitle",
                      "Para poder publicar ofertas o postularte, necesitas una suscripción activa.",
                    )}{" "}
                    <Button
                      component={Link}
                      href="/suscripcion"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      {t("subscription_plans_title", "Planes de Suscripción")}
                    </Button>
                  </Alert>
                )}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <ShareButtons
        title={titulo}
        url={typeof window !== "undefined" ? window.location.href : ""}
        onDownload={handleDownload}
      />

      {showPaymentModal && (
        <FeatureOfferPaymentModal
          show
          offerId={offerId}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </Stack>
  );
}
