"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Profile } from "@/lib/types";
import { useTranslation } from "react-i18next";
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
} from "@mui/material";
import VideosSection from "./VideosSection";
import UserPhotosSection from "./UserPhotosSection";
import ShareButtons from "@/components/ui/ShareButtons";
import EditProfileModal from "./EditProfileModal";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PublicIcon from "@mui/icons-material/Public";
import { usePathname, useRouter } from "next/navigation";
import MyApplicationsSection from "./MyApplicationsSection";
import { useAuth } from "@/context/AuthContext"; // <--- CONEXIÓN REAL

interface ProfilePageClientProps {
  profile: Profile | null;
}

export default function ProfilePageClient({
  profile: initialProfile,
}: ProfilePageClientProps) {
  const { t, i18n } = useTranslation();

  // CORRECCIÓN: Usamos el usuario real del contexto, no el mock
  const { user: currentUser } = useAuth();

  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [profile, setProfile] = useState(initialProfile);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    // Validación segura de IDs
    if (
      profile &&
      currentUser &&
      String(profile.id) !== String(currentUser.id)
    ) {
      const recordView = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
          // Usamos sendBeacon si es posible para no bloquear, o fetch simple
          await fetch(`${apiUrl}/profiles/${profile.id}/view`, {
            method: "POST",
          });
        } catch (error) {
          console.error("Failed to record profile view:", error);
        }
      };
      recordView();
    }
  }, [profile, currentUser]);

  const handleRatingChange = async (event: any, newValue: number | null) => {
    if (!newValue || !profile) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
      const res = await fetch(`${apiUrl}/profiles/${profile.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newValue }),
      });
      if (!res.ok) throw new Error("Failed to submit rating");
      const updatedProfile = await res.json();
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

  if (!profile) {
    return (
      <Alert severity="warning">
        {t("profile_not_found", "Perfil no encontrado.")}
      </Alert>
    );
  }

  // Comparación segura de IDs
  const isMyProfile =
    currentUser && String(currentUser.id) === String(profile.id);

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
        sx={{ maxWidth: 1350, width: "100%", p: { xs: 1, sm: 2, md: 3 } }}
        elevation={3}
      >
        <CardContent>
          <Grid container spacing={4}>
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
                    {profile.foto_perfil_url ? (
                      <Box
                        sx={{ flexShrink: 0, cursor: "pointer" }}
                        onClick={handleOpenImageModal}
                      >
                        <img
                          src={profile.foto_perfil_url}
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
                    ) : (
                      <Box
                        sx={{
                          width: 150,
                          height: 150,
                          borderRadius: "50%",
                          bgcolor: "#e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: "2px solid #ccc",
                        }}
                      >
                        <Typography variant="caption">
                          {t("no_image")}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="h4">
                      {profile.nombre} {profile.apellido || ""}
                    </Typography>

                    {/* Botón de Editar solo si es mi perfil */}
                    {isMyProfile && (
                      <Button variant="contained" onClick={handleOpenEditModal}>
                        {t("edit_profile_button", "Editar Perfil")}
                      </Button>
                    )}

                    <ShareButtons
                      title={`${profile.nombre} ${profile.apellido || ""}`}
                      url={pathname}
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
                        <strong>{t("email_label")}</strong> {profile.email}
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
                  </Stack>
                </Box>
                {!isMyProfile && (
                  <Box sx={{ ml: { sm: 4 }, mt: { xs: 2, sm: 0 } }}>
                    <Typography component="legend">
                      {t("rate_profile", "Calificar Perfil")}
                    </Typography>
                    <Rating
                      name="profile-rating"
                      value={profile.average_rating || 0}
                      precision={0.5}
                      onChange={handleRatingChange}
                      disabled={isPending}
                    />
                    {profile.total_ratings > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        ({profile.total_ratings}{" "}
                        {t("ratings", "calificaciones")})
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
            </Grid>
          </Grid>

          <UserPhotosSection userId={profile.id} isMyProfile={isMyProfile} />
          <VideosSection userId={profile.id} isMyProfile={isMyProfile} />

          {isMyProfile && <MyApplicationsSection userId={profile.id} />}
        </CardContent>
      </Card>

      {isMyProfile && (
        <EditProfileModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          profileData={profile}
          onSave={handleProfileSave}
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
            src={profile.foto_perfil_url}
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
