"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Profile } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { FaWhatsapp } from "react-icons/fa";
import {
  Typography,
  Alert,
  Stack,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  Rating,
  Modal,
  IconButton,
  LinearProgress,
} from "@mui/material";
import VideosSection from "./VideosSection";
import UserPhotosSection from "./UserPhotosSection";
import ScoutingReportsSection from "./ScoutingReportsSection";
import ShareButtons from "@/components/ui/ShareButtons";
import EditProfileModal from "./EditProfileModal";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PublicIcon from "@mui/icons-material/Public";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import apiClient from "@/lib/apiClient";
import { usePathname, useRouter } from "next/navigation";
import MyApplicationsSection from "./MyApplicationsSection";
import MyOffersSection from "./MyOffersSection";
import ManagedPlayerProfilesSection from "./ManagedPlayerProfilesSection";
import { useAuth } from "@/context/AuthContext"; // <--- CONEXIÓN REAL
import AdBanner from "@/components/ads/AdBanner";

interface ProfilePageClientProps {
  profile: Profile | null;
  requestedProfileId?: string;
}

const ANONYMOUS_VOTER_ID_KEY = "fp_anonymous_voter_id";

const getOrCreateAnonymousVoterId = () => {
  if (typeof window === "undefined") return null;

  try {
    const existing = window.localStorage.getItem(ANONYMOUS_VOTER_ID_KEY);
    if (existing) return existing;

    const newId =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(ANONYMOUS_VOTER_ID_KEY, newId);
    return newId;
  } catch (_error) {
    return null;
  }
};

export default function ProfilePageClient({
  profile: initialProfile,
  requestedProfileId,
}: ProfilePageClientProps) {
  const { t, i18n } = useTranslation();

  // CORRECCIÓN: Usamos el usuario real del contexto, no el mock
  const { user: currentUser, loading: authLoading } = useAuth();

  const normalizeWhatsAppUrl = (value?: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const digits = trimmed.replace(/[^0-9+]/g, "");
    if (!digits) return "";
    const cleaned = digits.startsWith("+") ? digits.slice(1) : digits;
    return `https://wa.me/${cleaned}`;
  };

  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const [profile, setProfile] = useState(initialProfile);
  const [attemptedPrivateProfileLoad, setAttemptedPrivateProfileLoad] =
    useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileStats, setProfileStats] = useState<any>(null);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [anonymousVoterId, setAnonymousVoterId] = useState<string | null>(null);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    setAnonymousVoterId(getOrCreateAnonymousVoterId());
  }, []);

  useEffect(() => {
    if (
      profile ||
      authLoading ||
      attemptedPrivateProfileLoad ||
      !currentUser ||
      !requestedProfileId ||
      String(currentUser.id) !== String(requestedProfileId)
    ) {
      return;
    }

    const loadOwnPrivateProfile = async () => {
      try {
        const { data } = await apiClient.get(`/profiles/${requestedProfileId}`);
        setProfile(data);
      } catch (error) {
        console.error("Failed to load private profile:", error);
      } finally {
        setAttemptedPrivateProfileLoad(true);
      }
    };

    loadOwnPrivateProfile();
  }, [
    profile,
    authLoading,
    attemptedPrivateProfileLoad,
    currentUser,
    requestedProfileId,
  ]);

  const isManagedProfile = Boolean(profile?.is_managed_profile);
  const isOwnAccountProfile =
    currentUser &&
    profile &&
    !isManagedProfile &&
    String(currentUser.id) === String(profile.id);
  const isManagedProfileOwner =
    currentUser &&
    profile &&
    isManagedProfile &&
    String(currentUser.id) === String(profile.owner_user_id);
  const canEditProfile = Boolean(isOwnAccountProfile || isManagedProfileOwner);
  const canManagePlayerProfiles =
    currentUser?.tipo_usuario === "ofertante" &&
    ["club", "agente", "scout"].includes(currentUser?.rol);

  useEffect(() => {
    if (!isOwnAccountProfile || !profile) return;

    const loadStats = async () => {
      try {
        const { data } = await apiClient.get(`/profiles/${profile.id}/stats`);
        setProfileStats(data);
      } catch (error) {
        console.error("Failed to load profile stats:", error);
      }
    };

    loadStats();
  }, [isOwnAccountProfile, profile]);

  useEffect(() => {
    if (!profile || canEditProfile || isManagedProfile) {
      setMyRating(null);
      return;
    }

    if (authLoading || (!currentUser && !anonymousVoterId)) {
      return;
    }

    const loadMyRating = async () => {
      try {
        const { data } = await apiClient.get(`/profiles/${profile.id}/my-rating`, {
          headers: anonymousVoterId
            ? { "x-anonymous-voter-id": anonymousVoterId }
            : undefined,
        });
        setMyRating(data.rating);
      } catch (error) {
        setMyRating(null);
      }
    };

    loadMyRating();
  }, [
    anonymousVoterId,
    authLoading,
    currentUser,
    profile,
    canEditProfile,
    isManagedProfile,
  ]);

  useEffect(() => {
    // Validación segura de IDs
    if (
      profile &&
      currentUser &&
      !canEditProfile
    ) {
      const recordView = async () => {
        try {
          // Usamos apiClient para asegurar que el token se envíe si es necesario
          await apiClient.post(`/profiles/${profile.id}/view`);
        } catch (error) {
          console.error("Failed to record profile view:", error);
        }
      };
      recordView();
    }
  }, [profile, currentUser, canEditProfile]);

  const handleRatingChange = async (event: any, newValue: number | null) => {
    if (!newValue || !profile) return;
    try {
      const res = await apiClient.post(
        `/profiles/${profile.id}/rate`,
        {
          rating: newValue,
        },
        {
          headers: anonymousVoterId
            ? { "x-anonymous-voter-id": anonymousVoterId }
            : undefined,
        },
      );
      const updatedProfile = res.data;
      setMyRating(updatedProfile.user_rating ?? newValue);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              average_rating: updatedProfile.average_rating,
              total_ratings: updatedProfile.total_ratings,
            }
          : null,
      );
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(t("rating_error", "Hubo un error al enviar tu calificación."));
    }
  };

  const handleOpenImageModal = () => setIsImageModalOpen(true);
  const handleCloseImageModal = () => setIsImageModalOpen(false);

  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleProfileSave = () => {
    handleCloseEditModal();
    startTransition(() => router.refresh());
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      t(
        "confirm_delete_account",
        "¿Seguro que querés eliminar tu cuenta? Se borrarán tus datos, perfiles, ofertas y postulaciones. Esta acción no se puede deshacer.",
      ),
    );

    if (!confirmed) return;

    const typedConfirmation = window.prompt(
      t(
        "confirm_delete_account_prompt",
        "Escribí ELIMINAR para confirmar la baja de tu cuenta.",
      ),
    );

    if (typedConfirmation !== "ELIMINAR") return;

    try {
      await apiClient.delete("/users/me");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          t("delete_account_error", "No se pudo eliminar la cuenta."),
      );
    }
  };

  if (!isHydrated) {
    return null;
  }

  if (!profile && authLoading) {
    return null;
  }

  if (!profile) {
    return (
      <Alert severity="warning">
        {t("profile_not_found", "Perfil no encontrado.")}
      </Alert>
    );
  }

  const lang = i18n.language;

  // Acceso seguro a propiedades dinámicas
  const p = profile as any;
  const nacionalidad = p[`nacionalidad_${lang}`] || profile.nacionalidad;
  const posicion_principal =
    p[`posicion_principal_${lang}`] || profile.posicion_principal;
  const pie_dominante = p[`pie_dominante_${lang}`] || profile.pie_dominante;
  const resumen_profesional =
    p[`resumen_profesional_${lang}`] || profile.resumen_profesional;

  return (
    <Stack alignItems="center" sx={{ mt: 4, mb: 4 }}>
      <Card
        className="profile-card-watermark"
        sx={{ maxWidth: 1350, width: "100%", p: { xs: 1, sm: 2, md: 3 } }}
        elevation={3}
      >
        <CardContent>
          <Grid container spacing={4}>
            {isOwnAccountProfile && profileStats && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc" }}>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      gap={2}
                    >
                      <Box>
                        <Typography variant="h6">
                          {t("profile_metrics_title", "Métricas de tu perfil")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t(
                            "profile_metrics_subtitle",
                            "Controla visibilidad, postulaciones y nivel de completitud.",
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: { xs: "100%", md: 260 } }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {t("profile_completion", "Perfil completo")}:{" "}
                          {profileStats.completion_percent}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={profileStats.completion_percent}
                          sx={{ height: 8, borderRadius: 2 }}
                        />
                      </Box>
                    </Stack>

                    <Grid container spacing={2}>
                      {[
                        {
                          label: t("profile_views_header", "Vistas de Perfil"),
                          value: profileStats.profile_views,
                        },
                        {
                          label: t("applications_sent_metric", "Postulaciones enviadas"),
                          value: profileStats.applications_sent,
                        },
                        {
                          label: t("offers_published_metric", "Ofertas publicadas"),
                          value: profileStats.offers_published,
                        },
                        {
                          label: t("applications_received_metric", "Postulaciones recibidas"),
                          value: profileStats.applications_received,
                        },
                      ].map((metric) => (
                        <Grid item xs={6} md={3} key={metric.label}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              {metric.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {metric.label}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Card>
              </Grid>
            )}
            {/* ==== LEFT COLUMN ==== */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                {/* Profile Header */}
                <Grid item xs={12} sm={6}>
                  <Stack
                    direction="column"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box
                      sx={{ flexShrink: 0, cursor: "pointer" }}
                      onClick={handleOpenImageModal}
                    >
                      <img
                        src={profile.foto_perfil_url || '/images/logos/logofp.png'}
                        alt={t("profile_picture_alt", {
                          name: profile.nombre,
                        })}
                        width="150"
                        height="150"
                        style={{
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #ccc",
                        }}
                      />
                    </Box>
                    <Typography variant="h4">
                      {profile.nombre} {profile.apellido ? profile.apellido : ""}
                    </Typography>

                    {/* Botón de Editar solo si es mi perfil */}
                    {canEditProfile && (
                      <Button variant="contained" onClick={handleOpenEditModal}>
                        {t("edit_profile_button", "Editar Perfil")}
                      </Button>
                    )}

                    <ShareButtons
                      title={`${profile.nombre} ${profile.apellido ? profile.apellido : ""}`.trim()}
                      url={pathname}
                      requestRatings={Boolean(isOwnAccountProfile)}
                    />
                  </Stack>
                </Grid>
                {/* Personal Data */}
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {t("personal_data", "Datos Personales")}
                    </Typography>
                    <Stack spacing={1}>
                      <Typography>
                        <strong>{t("email_label")}</strong>{" "}
                        {profile.email || t("not_specified")}
                      </Typography>
                      <Typography>
                        <strong>{t("phone_placeholder")}</strong>{" "}
                        {profile.telefono || t("not_specified")}
                      </Typography>
                      <Typography>
                        <strong>{t("nationality")}</strong>{" "}
                        {nacionalidad || t("not_specified")}
                      </Typography>
                      <Typography>
                        <strong>{t("position")}</strong>{" "}
                        {posicion_principal || t("not_specified")}
                      </Typography>
                      <Typography>
                        <strong>{t("agent_name_label", "Agente")}</strong>{" "}
                        {profile.agente_nombre || t("not_specified")}
                      </Typography>
                      <Typography>
                        <strong>{t("agent_contact_label", "Contacto Agente")}</strong>{" "}
                        {profile.agente_contacto || t("not_specified")}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>

              {/* Social & Rating */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                sx={{
                  mt: 4,
                  mb: 3,
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}>
                    {t("social_networks_links_title")}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {profile.linkedin_url && (
                      <IconButton
                        component="a"
                        href={profile.linkedin_url}
                        target="_blank"
                      >
                        <LinkedInIcon />
                      </IconButton>
                    )}
                    {profile.instagram_url && (
                      <IconButton
                        component="a"
                        href={profile.instagram_url}
                        target="_blank"
                      >
                        <InstagramIcon />
                      </IconButton>
                    )}
                    {profile.youtube_url && (
                      <IconButton
                        component="a"
                        href={profile.youtube_url}
                        target="_blank"
                      >
                        <YouTubeIcon />
                      </IconButton>
                    )}
                    {profile.transfermarkt_url && (
                      <IconButton
                        component="a"
                        href={profile.transfermarkt_url}
                        target="_blank"
                      >
                        <PublicIcon />
                      </IconButton>
                    )}
                    {profile.whatsapp_url && (
                      <Button
                        component="a"
                        href={normalizeWhatsAppUrl(profile.whatsapp_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<FaWhatsapp />}
                        sx={{ color: "#25D366", textTransform: "none", ml: 1 }}
                      >
                        {t("contact_whatsapp", "Contactar por WhatsApp")}
                      </Button>
                    )}
                    {canEditProfile && !profile.whatsapp_url && (
                      <Button
                        variant="outlined"
                        onClick={handleOpenEditModal}
                        startIcon={<FaWhatsapp />}
                        sx={{ textTransform: "none", mt: 1 }}
                      >
                        {t("add_whatsapp_visually", "Agregar WhatsApp")}
                      </Button>
                    )}
                  </Stack>
                </Box>
                {!canEditProfile && !isManagedProfile && (
                  <Box sx={{ ml: { sm: 4 }, mt: { xs: 2, sm: 0 } }}>
                    <Typography component="legend" sx={{ fontWeight: 700 }}>
                      {t("profile_average_rating", "Promedio del perfil")}
                    </Typography>
                    <Rating
                      name="profile-average-rating"
                      value={Number(profile.average_rating || 0)}
                      precision={0.5}
                      readOnly
                    />
                    {profile.total_ratings > 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {Number(profile.average_rating || 0).toFixed(1)} / 5 ·{" "}
                        {profile.total_ratings} {t("ratings", "calificaciones")}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {t("no_ratings_yet", "Sin calificaciones todavía")}
                      </Typography>
                    )}

                    <Typography component="legend">
                      {t("rate_profile", "Calificar Perfil")}
                    </Typography>
                    <Rating
                      name="profile-rating"
                      value={myRating || 0}
                      precision={1}
                      onChange={handleRatingChange}
                      disabled={
                        isPending || authLoading || (!currentUser && !anonymousVoterId)
                      }
                    />
                    {myRating ? (
                      <Typography variant="body2" color="text.secondary">
                        {t("your_rating", "Tu calificación")}: {myRating} / 5
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t("not_rated_by_you", "Todavía no calificaste este perfil")}
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            </Grid>

            {/* ==== RIGHT COLUMN ==== */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t("physical_data")}
                </Typography>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Typography>
                    <strong>{t("height")}</strong>{" "}
                    {profile.altura_cm
                      ? `${profile.altura_cm} cm`
                      : t("not_specified")}
                  </Typography>
                  <Typography>
                    <strong>{t("weight")}</strong>{" "}
                    {profile.peso_kg
                      ? `${profile.peso_kg} kg`
                      : t("not_specified")}
                  </Typography>
                  <Typography>
                    <strong>{t("dominant_foot")}</strong>{" "}
                    {pie_dominante || t("not_specified")}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t("professional_summary")}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  {resumen_profesional || t("no_summary_available")}
                </Typography>
                {profile.cv_url && (
                  <Button
                    variant="outlined"
                    href={profile.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("download_cv")}
                  </Button>
                )}
              </Card>
              <AdBanner placement="player_profile_sidebar" compact />
            </Grid>
          </Grid>

          {!isManagedProfile && (
            <ScoutingReportsSection userId={profile.id} isMyProfile={Boolean(isOwnAccountProfile)} />
          )}
          <UserPhotosSection userId={profile.id} isMyProfile={canEditProfile} />
          <VideosSection
            userId={profile.id}
            isMyProfile={canEditProfile}
            createEndpoint={
              isManagedProfile ? `/profiles/${profile.id}/videos` : "/profiles/videos"
            }
            updateEndpointBuilder={(videoId) =>
              isManagedProfile
                ? `/profiles/managed-videos/${videoId}`
                : `/profiles/videos/${videoId}`
            }
            deleteEndpointBuilder={(videoId) =>
              isManagedProfile
                ? `/profiles/managed-videos/${videoId}`
                : `/profiles/videos/${videoId}`
            }
          />

          {isOwnAccountProfile && canManagePlayerProfiles && <ManagedPlayerProfilesSection />}
          {isOwnAccountProfile && <MyApplicationsSection userId={profile.id} />}
          {isOwnAccountProfile && currentUser?.tipo_usuario === 'ofertante' && (
            <MyOffersSection userId={profile.id} />
          )}
          {isOwnAccountProfile && (
            <Card variant="outlined" sx={{ mt: 4, borderColor: "error.light" }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Box>
                    <Typography variant="h6" color="error">
                      {t("delete_account_title", "Eliminar cuenta")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(
                        "delete_account_description",
                        "Da de baja tu cuenta y elimina tus datos asociados de FutbolProyect.",
                      )}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={handleDeleteAccount}
                  >
                    {t("delete_account_button", "Eliminar cuenta")}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {canEditProfile && (
        <EditProfileModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          profileData={profile}
          onSave={handleProfileSave}
          saveEndpoint={
            isManagedProfile
              ? `/profiles/managed/${String(profile.id).replace("managed-", "")}`
              : "/profiles/me"
          }
          showEmailField={isManagedProfile}
        />
      )}

      <Modal open={isImageModalOpen} onClose={handleCloseImageModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
            maxWidth: "90vw",
            maxHeight: "90vh",
          }}
        >
          <img
            src={profile.foto_perfil_url || '/images/logos/logofp.png'}
            alt={t("profile_picture_alt", { name: profile.nombre })}
            style={{
              maxWidth: "100%",
              maxHeight: "calc(90vh - 16px)",
              objectFit: "contain",
            }}
          />
        </Box>
      </Modal>
    </Stack>
  );
}
