"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import FeatureOfferPaymentModal from "@/components/FeatureOfferPaymentModal";
import OfferActions from "@/components/shared/OfferActions";
import ShareButtons from "@/components/ShareButtons";
import { Offer } from "@/lib/types";

type Props = {
  offerId: string;
};

const fetchOffer = async (offerId: string) => {
  const { data } = await apiClient.get<Offer>(`/offers/${offerId}`);
  return data;
};

const renderLinkedText = (text: string) => {
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(urlPattern)) {
    const rawUrl = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    const trailing = rawUrl.match(/[.,;:!?)]*$/)?.[0] || "";
    const cleanUrl = rawUrl.slice(0, rawUrl.length - trailing.length);
    const href = cleanUrl.startsWith("www.") ? `https://${cleanUrl}` : cleanUrl;
    nodes.push(
      <Box
        key={`${cleanUrl}-${index}`}
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ color: "#1262db", textDecoration: "underline" }}
      >
        {cleanUrl}
      </Box>,
    );
    if (trailing) nodes.push(trailing);
    lastIndex = index + rawUrl.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
};

const formatDate = (value: string | undefined, language: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language.startsWith("en") ? "en-US" : "es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function OfferDetailClient({ offerId }: Props) {
  const { t, i18n } = useTranslation("common");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [applied, setApplied] = useState(false);
  const offerCardRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = Boolean(user?.isAdmin || user?.isadmin);
  const hasActiveSubscription = user?.subscription_status === "activa";
  const canViewOfferDetail = isAdmin || hasActiveSubscription;

  const {
    data: offer,
    isLoading,
    isError,
    error,
  } = useQuery<Offer, Error>({
    queryKey: ["offer", offerId],
    queryFn: () => fetchOffer(offerId),
    enabled: Boolean(offerId && !authLoading && canViewOfferDetail),
    retry: (failureCount, queryError: any) => {
      const status = queryError?.response?.status;
      return status !== 401 && status !== 403 && failureCount < 3;
    },
  });

  const accessStatus = (error as any)?.response?.status;
  const shouldShowSubscriptionGate =
    isError && (accessStatus === 401 || accessStatus === 403);

  const lang = i18n.language?.startsWith("en") ? "en" : "es";
  const titulo = offer?.[`titulo_${lang}`] || offer?.titulo || "";
  const descripcion =
    offer?.[`descripcion_${lang}`] || offer?.descripcion || "";
  const ubicacion =
    offer?.[`ubicacion_${lang}`] || offer?.ubicacion || "";
  const puesto = offer?.[`puesto_${lang}`] || offer?.puesto || "";
  const nivel = offer?.[`nivel_${lang}`] || offer?.nivel || "";
  const horarios =
    offer?.[`horarios_${lang}`] || offer?.horarios || "";
  const detallesAdicionales =
    offer?.[`detalles_adicionales_${lang}`] ||
    offer?.detalles_adicionales ||
    "";
  const publicationDate = formatDate(offer?.fecha_publicacion, lang);
  const isOwner =
    Boolean(user && offer) &&
    String(user?.id) === String(offer?.id_usuario_ofertante);

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
      jobLocation: ubicacion
        ? {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressLocality: ubicacion },
          }
        : undefined,
    };
  }, [offer, titulo, descripcion, ubicacion]);

  useEffect(() => {
    if (!jobPostingSchema) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "job-posting-schema";
    script.innerHTML = JSON.stringify(jobPostingSchema);
    document.head.appendChild(script);
    return () => document.getElementById("job-posting-schema")?.remove();
  }, [jobPostingSchema]);

  const { mutate: deleteOffer } = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/offers/${id}`),
    onSuccess: () => {
      toast.success(t("offer_deleted_successfully", "Oferta eliminada con éxito"));
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      router.push("/all-offers");
    },
    onError: (mutationError: any) => {
      toast.error(
        mutationError?.message ||
          t("offer_delete_error", "Error al eliminar la oferta"),
      );
    },
  });

  const { mutate: applyToOffer, isPending: isApplying } = useMutation({
    mutationFn: () => apiClient.post("/applications", { id_oferta: offerId }),
    onSuccess: () => {
      setApplied(true);
      toast.success(t("apply_success", "¡Postulación exitosa!"));
    },
    onError: (mutationError: any) => {
      toast.error(
        mutationError?.response?.data?.message ||
          t("apply_error_generic", "Ocurrió un error al postular."),
      );
    },
  });

  const handleOfferAction = (action: string, id: string) => {
    if (action === "edit") router.push(`/offers/edit/${id}`);
    if (action === "delete" && window.confirm("¿Eliminar esta oferta?")) {
      deleteOffer(id);
    }
  };

  const handleDownload = async () => {
    if (!offerCardRef.current) return;
    const canvas = await html2canvas(offerCardRef.current);
    const link = document.createElement("a");
    link.download = `oferta-${offerId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (authLoading || isLoading) {
    return (
      <Box sx={{ minHeight: 420, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!canViewOfferDetail || shouldShowSubscriptionGate) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert
          severity="warning"
          action={
            <Button component={Link} href="/suscripcion" color="inherit">
              {t("view_plans")}
            </Button>
          }
        >
          Necesitás una suscripción activa para ver los detalles de la oferta.
        </Alert>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          {(error as any)?.response?.data?.message ||
            error.message ||
            "Error al cargar la oferta."}
        </Alert>
      </Container>
    );
  }

  if (!offer) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="info">{t("offer_not_found")}</Alert>
      </Container>
    );
  }

  const summaryRows = [
    { label: "Ubicación", value: ubicacion, icon: <PlaceOutlinedIcon /> },
    { label: "Puesto", value: puesto, icon: <BadgeOutlinedIcon /> },
    { label: "Nivel", value: nivel, icon: <WorkspacePremiumOutlinedIcon /> },
    { label: "Jornada", value: horarios, icon: <ScheduleOutlinedIcon /> },
    {
      label: "Publicación",
      value: publicationDate,
      icon: <CalendarMonthOutlinedIcon />,
    },
    {
      label: "Salario",
      value: offer.salario ? String(offer.salario) : "",
      icon: <PaymentsOutlinedIcon />,
    },
    { label: "ID de oferta", value: `#FP-${offer.id}`, icon: <NumbersRoundedIcon /> },
  ];

  const quickFacts = [
    { value: ubicacion, icon: <PlaceOutlinedIcon /> },
    { value: puesto, icon: <BadgeOutlinedIcon /> },
    { value: nivel, icon: <WorkspacePremiumOutlinedIcon /> },
    { value: horarios, icon: <ScheduleOutlinedIcon /> },
  ].filter((item) => item.value);

  return (
    <Box sx={{ bgcolor: "#f7f9fc", pb: { xs: 7, md: 10 } }}>
      <Box
        component="section"
        sx={{
          color: "#fff",
          py: { xs: 4, md: 5.5 },
          backgroundImage:
            "linear-gradient(90deg, rgba(2, 15, 37, .98), rgba(3, 31, 70, .9)), url('/images/estadio-futbol.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center 58%",
        }}
      >
        <Container maxWidth="lg">
          <Button
            component={Link}
            href="/all-offers"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ color: "rgba(255,255,255,.85)", px: 0, mb: 3 }}
          >
            {t("back_to_offers")}
          </Button>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "150px minmax(0, 1fr)" },
              gap: { xs: 2.5, md: 4 },
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: { xs: 96, sm: 150 },
                height: { xs: 96, sm: 150 },
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,.96)",
                border: "1px solid rgba(255,255,255,.35)",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                boxShadow: "0 14px 35px rgba(0,0,0,.24)",
              }}
            >
              <Image
                src={offer.imagen_url || "/images/logos/logofpazul.webp"}
                alt={titulo}
                width={150}
                height={150}
                sizes="(max-width: 600px) 96px, 150px"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: offer.imagen_url ? 8 : 24,
                  opacity: offer.imagen_url ? 1 : 0.35,
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} alignItems="center">
                {offer.is_featured && (
                  <Chip
                    label={t("featured")}
                    size="small"
                    sx={{ bgcolor: "#1262db", color: "#fff", fontWeight: 800 }}
                  />
                )}
                {publicationDate && (
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,.72)" }}>
                    {publicationDate}
                  </Typography>
                )}
              </Stack>
              <Typography
                component="h1"
                sx={{
                  mt: 1.2,
                  maxWidth: 850,
                  color: "#fff",
                  fontSize: { xs: "1.85rem", md: "2.65rem" },
                  lineHeight: 1.12,
                  letterSpacing: "-0.035em",
                  fontWeight: 900,
                }}
              >
                {titulo}
              </Typography>
              {offer.nombre_ofertante && (
                <Typography sx={{ mt: 1, color: "rgba(255,255,255,.76)" }}>
                  Publicado por {offer.nombre_ofertante}
                </Typography>
              )}
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mt: 2.2 }}>
                {quickFacts.map((fact) => (
                  <Chip
                    key={fact.value}
                    icon={fact.icon}
                    label={fact.value}
                    variant="outlined"
                    sx={{
                      color: "#fff",
                      borderColor: "rgba(255,255,255,.25)",
                      bgcolor: "rgba(255,255,255,.08)",
                      "& .MuiChip-icon": { color: "#fff" },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Paper
            ref={offerCardRef}
            elevation={0}
            sx={{
              p: { xs: 2.25, md: 3.5 },
              border: "1px solid #dfe6ef",
              borderRadius: 2.5,
            }}
          >
            <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>
              <Chip
                label={t("description_label")}
                sx={{ bgcolor: "#eaf3ff", color: "#1262db", fontWeight: 900 }}
              />
              {detallesAdicionales && (
                <Chip label={t("additional_details")} variant="outlined" />
              )}
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Typography
              component="h2"
              sx={{ color: "#0a1930", fontSize: "1.3rem", fontWeight: 900 }}
            >
              {t("offer_description_title")}
            </Typography>
            <Typography
              component="div"
              sx={{
                mt: 1.5,
                color: "#3d4b60",
                lineHeight: 1.8,
                whiteSpace: "pre-line",
                overflowWrap: "anywhere",
              }}
            >
              {descripcion
                ? renderLinkedText(descripcion)
                : t("offer_description_missing")}
            </Typography>

            {detallesAdicionales && (
              <>
                <Divider sx={{ my: 3.5 }} />
                <Typography
                  component="h2"
                  sx={{ color: "#0a1930", fontSize: "1.3rem", fontWeight: 900 }}
                >
                  {t("additional_details")}
                </Typography>
                <Typography
                  component="div"
                  sx={{
                    mt: 1.5,
                    color: "#3d4b60",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                    overflowWrap: "anywhere",
                  }}
                >
                  {renderLinkedText(detallesAdicionales)}
                </Typography>
              </>
            )}

            {(isOwner || isAdmin) && (
              <>
                <Divider sx={{ my: 3 }} />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                  <Button
                    variant="contained"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Destacar oferta
                  </Button>
                  <OfferActions
                    offer={offer}
                    onOfferAction={handleOfferAction}
                    isFetching={isLoading}
                  />
                </Stack>
              </>
            )}
          </Paper>

          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid #dfe6ef",
                borderRadius: 2.5,
                boxShadow: "0 10px 28px rgba(8, 34, 70, .07)",
              }}
            >
              <Typography sx={{ color: "#0a1930", fontSize: "1.15rem", fontWeight: 900 }}>
                Postulate a esta oferta
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.7, color: "#65738a" }}>
                Enviá tu perfil y formá parte de este proyecto deportivo.
              </Typography>

              {user?.tipo_usuario === "postulante" && !isOwner && !isAdmin ? (
                hasActiveSubscription && !applied ? (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SendRoundedIcon />}
                    onClick={() => applyToOffer()}
                    disabled={isApplying}
                    sx={{ mt: 2, py: 1.15, bgcolor: "#1262db", fontWeight: 900 }}
                  >
                    {isApplying ? t("applying") : t("apply_now")}
                  </Button>
                ) : applied ? (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    ¡Postulación enviada!
                  </Alert>
                ) : (
                  <Button
                    fullWidth
                    component={Link}
                    href="/suscripcion"
                    variant="contained"
                    sx={{ mt: 2 }}
                  >
                    {t("view_subscription_plans")}
                  </Button>
                )
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  La postulación está disponible para perfiles de postulantes.
                </Alert>
              )}

              <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mt: 1.5 }}>
                <LockOutlinedIcon sx={{ fontSize: 15, color: "#7a8799" }} />
                <Typography variant="caption" sx={{ color: "#7a8799" }}>
                  Tu información se envía de forma confidencial.
                </Typography>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{ p: 2.5, border: "1px solid #dfe6ef", borderRadius: 2.5 }}
            >
              <Typography sx={{ color: "#0a1930", fontWeight: 900 }}>
                Resumen de la oferta
              </Typography>
              <Stack divider={<Divider flexItem />} sx={{ mt: 1.5 }}>
                {summaryRows.map((row) => (
                  <Stack
                    key={row.label}
                    direction="row"
                    justifyContent="space-between"
                    spacing={1.5}
                    sx={{ py: 1.15 }}
                  >
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Box sx={{ color: "#52709a", display: "flex", "& svg": { fontSize: 18 } }}>
                        {row.icon}
                      </Box>
                      <Typography variant="body2" sx={{ color: "#65738a" }}>
                        {row.label}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{ color: "#17243a", fontWeight: 700, textAlign: "right" }}
                    >
                      {row.value || t("not_specified")}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{ p: 2.5, border: "1px solid #dfe6ef", borderRadius: 2.5 }}
            >
              <Typography sx={{ color: "#0a1930", fontWeight: 900 }}>
                {t("share_this_offer")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.6, mb: 1.5, color: "#65738a" }}>
                Ayudá a otros profesionales a encontrar nuevas oportunidades.
              </Typography>
              <ShareButtons
                title={titulo}
                url={typeof window !== "undefined" ? window.location.href : ""}
                onDownload={handleDownload}
              />
            </Paper>
          </Stack>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2.5, md: 3 },
            borderRadius: 2.5,
            color: "#fff",
            background: "linear-gradient(115deg, #061831, #0a3269)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,.09)",
                display: "grid",
                placeItems: "center",
                color: "#65a8ff",
                flexShrink: 0,
              }}
            >
              <SportsSoccerOutlinedIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: "1.15rem" }}>
                ¿Sos un club o academia?
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,.72)" }}>
                Publicá tus ofertas y encontrá el talento que tu proyecto necesita.
              </Typography>
            </Box>
          </Stack>
          <Button
            component={Link}
            href="/create-offer"
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,.42)",
              whiteSpace: "nowrap",
              fontWeight: 900,
              "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.08)" },
            }}
          >
            {t("publish_an_offer")}
          </Button>
        </Paper>
      </Container>

      {showPaymentModal && (
        <FeatureOfferPaymentModal
          show
          offerId={offerId}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </Box>
  );
}
