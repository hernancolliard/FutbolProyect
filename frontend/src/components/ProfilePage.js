import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Grid } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PublicIcon from '@mui/icons-material/Public';
import { useAuth } from "../context/AuthContext";
import useIsMobile from "../hooks/useIsMobile";
import VideoCard from "./VideoCard";
import VideoPlayerModal from "./VideoPlayerModal";
import VideoFormModal from "./VideoFormModal";
import EditProfileForm from "./EditProfileForm";
import Modal from "@mui/material/Modal";
import UserPhotosSection from "./UserPhotosSection";
import MyOffersList from "./MyOffersList";

const fetchProfile = async (userId) => {
  const { data } = await apiClient.get(`/profiles/${userId}`);
  return data;
};

const fetchUserVideos = async (userId) => {
  const { data } = await apiClient.get(`/profiles/${userId}/videos`);
  return data;
};

const fetchUserApplications = async (userId) => {
  const { data } = await apiClient.get(`/profiles/${userId}/applications`);
  return data;
};

const fetchUserOffers = async (userId) => {
    const { data } = await apiClient.get(`/profiles/${userId}/offers`);
    return data;
  };

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [selectedVideoToPlay, setSelectedVideoToPlay] = useState(null);
  const [showVideoFormModal, setShowVideoFormModal] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleOpenEditProfileModal = () => setShowEditProfileModal(true);
  const handleCloseEditProfileModal = () => setShowEditProfileModal(false);

  const handleProfileSaved = () => {
    queryClient.invalidateQueries(["profile", userId]);
    handleCloseEditProfileModal();
  };

  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile, error: errorProfile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
  });

  const { data: userVideos, isLoading: isLoadingVideos, isError: isErrorVideos, error: errorVideos } = useQuery({
    queryKey: ["userVideos", userId],
    queryFn: () => fetchUserVideos(userId),
    initialData: [],
  });

  const { data: userApplications, isLoading: isLoadingApplications, isError: isErrorApplications, error: errorApplications } = useQuery({
    queryKey: ["userApplications", userId],
    queryFn: () => fetchUserApplications(userId),
    enabled: !!currentUser && (currentUser.id === parseInt(userId, 10) || currentUser.isAdmin),
    initialData: [], // Ensure it's always an array
  });

  const { isLoading: isLoadingOffers, isError: isErrorOffers, error: errorOffers } = useQuery({
    queryKey: ["userOffers", userId],
    queryFn: () => fetchUserOffers(userId),
    enabled: !!profile && (profile.tipo_usuario === 'ofertante' || profile.tipo_usuario === 'agencia'),
  });

  const isMyProfile = currentUser && currentUser.id === parseInt(userId, 10);

  const handleOpenVideoPlayer = (video) => {
    setSelectedVideoToPlay(video);
    setShowVideoPlayerModal(true);
  };

  const handleCloseVideoPlayer = () => {
    setSelectedVideoToPlay(null);
    setShowVideoPlayerModal(false);
  };

  const handleOpenVideoForm = (video = null) => {
    setVideoToEdit(video);
    setShowVideoFormModal(true);
  };

  const handleCloseVideoForm = () => {
    setVideoToEdit(null);
    setShowVideoFormModal(false);
  };

  const handleVideoSaved = () => {
    queryClient.invalidateQueries(["userVideos", userId]);
  };

  if (isLoadingProfile) {
    return (
      <Stack alignItems="center" sx={{ mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t("loading_profile")}</Typography>
      </Stack>
    );
  }

  if (isErrorProfile) {
    return <Alert severity="error">{errorProfile.message || t("error_loading_profile")}</Alert>;
  }

  if (!profile) {
    return <Alert severity="warning">{t("profile_not_found")}</Alert>;
  }

  const videosToDisplay = Array(5).fill(null);
  userVideos.forEach((video) => {
    if (video.position >= 1 && video.position <= 5) {
      videosToDisplay[video.position - 1] = video;
    }
  });

  const lang = i18n.language;
  const nacionalidad = profile[`nacionalidad_${lang}`] || profile.nacionalidad;
  const posicion_principal = profile[`posicion_principal_${lang}`] || profile.posicion_principal;
  const pie_dominante = profile[`pie_dominante_${lang}`] || profile.pie_dominante;
  const resumen_profesional = profile[`resumen_profesional_${lang}`] || profile.resumen_profesional;

  return (
    <Stack alignItems="center" sx={{ mt: 4 }}>
      <Card sx={{ maxWidth: 900, width: "100%" }} elevation={3}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="flex-start" sx={{ mb: 4 }}>
            {profile.foto_perfil_url && (
              <Box sx={{ flexShrink: 0 }}>
                <img
                  src={profile.foto_perfil_url}
                  alt={t("profile_image")}
                  style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover", border: "2px solid #ccc" }}
                />
              </Box>
            )}
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {profile.nombre} {profile.apellido}
              </Typography>
              <Typography><strong>{t("email_label")}</strong> {profile.email}</Typography>
              <Typography><strong>{t("phone_placeholder")}</strong> {profile.telefono || t("not_specified")}</Typography>
              <Typography><strong>{t("nationality")}</strong> {nacionalidad || t("not_specified")}</Typography>
              <Typography><strong>{t("position")}</strong> {posicion_principal || t("not_specified")}</Typography>
            </Box>
            {isMyProfile && (
              <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpenEditProfileModal}>
                {t("edit_profile_button", "Editar Perfil")}
              </Button>
            )}
          </Stack>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>{t("social_networks_links_title")}</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {profile.linkedin_url &&
              (isMobile ? (
                <IconButton component="a" href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedInIcon /></IconButton>
              ) : (
                <Button variant="outlined" startIcon={<LinkedInIcon />} href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</Button>
              ))}
            {profile.instagram_url &&
              (isMobile ? (
                <IconButton component="a" href={profile.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></IconButton>
              ) : (
                <Button variant="outlined" startIcon={<InstagramIcon />} href={profile.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</Button>
              ))}
            {profile.youtube_url &&
              (isMobile ? (
                <IconButton component="a" href={profile.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><YouTubeIcon /></IconButton>
              ) : (
                <Button variant="outlined" startIcon={<YouTubeIcon />} href={profile.youtube_url} target="_blank" rel="noopener noreferrer">YouTube</Button>
              ))}
            {profile.transfermarkt_url &&
              (isMobile ? (
                <IconButton component="a" href={profile.transfermarkt_url} target="_blank" rel="noopener noreferrer" aria-label="Transfermarkt"><PublicIcon /></IconButton>
              ) : (
                <Button variant="outlined" startIcon={<PublicIcon />} href={profile.transfermarkt_url} target="_blank" rel="noopener noreferrer">Transfermarkt</Button>
              ))}
          </Stack>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>{t("physical_data")}</Typography>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography><strong>{t("height")}</strong> {profile.altura_cm ? `${profile.altura_cm} cm` : t("not_specified")}</Typography>
            <Typography><strong>{t("weight")}</strong> {profile.peso_kg ? `${profile.peso_kg} kg` : t("not_specified")}</Typography>
            <Typography><strong>{t("dominant_foot")}</strong> {pie_dominante || t("not_specified")}</Typography>
            <Typography><strong>{t("professional_summary")}</strong> {resumen_profesional || t("no_summary_available")}</Typography>
            {profile.cv_url && (
              <Button variant="outlined" sx={{ mt: 2 }} href={profile.cv_url} target="_blank" rel="noopener noreferrer">{t("download_cv")}</Button>
            )}
          </Stack>

          <UserPhotosSection userId={userId} isMyProfile={isMyProfile} />

          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>{t("profile_videos_title", "Videos del Perfil")}</Typography>
          {isLoadingVideos ? (
            <CircularProgress />
          ) : isErrorVideos ? (
            <Alert severity="error">{errorVideos.message || t("error_loading_videos", "Error al cargar videos.")}</Alert>
          ) : (
            <Grid container spacing={2}>
              {videosToDisplay.map((video, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <VideoCard video={video} onAdd={() => isMyProfile && handleOpenVideoForm({ position: index + 1 })} onPlay={handleOpenVideoPlayer} />
                </Grid>
              ))}
            </Grid>
          )}

          {isMyProfile && (
            <Button variant="contained" sx={{ mt: 3 }} onClick={() => handleOpenVideoForm()}>
              {t("add_new_video", "Añadir nuevo video")}
            </Button>
          )}

          {isMyProfile && (
            <>
              <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>{t("my_applications_title", "Mis Postulaciones")}</Typography>
              {isLoadingApplications ? (
                <CircularProgress />
              ) : isErrorApplications ? (
                <Alert severity="error">{errorApplications.message || t("error_loading_applications", "Error al cargar postulaciones.")}</Alert>
              ) : userApplications.length === 0 ? (
                <Typography>{t("no_applications_yet", "Aún no tienes postulaciones.")}</Typography>
              ) : (
                <Stack spacing={1}>
                  {userApplications.map((app) => (
                    <Card key={app.id} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="h6">{app.oferta_titulo}</Typography>
                      <Typography variant="body2"><strong>{t("status")}:</strong> {app.estado}</Typography>
                      <Typography variant="body2"><strong>{t("date")}:</strong> {new Date(app.fecha_postulacion).toLocaleDateString()}</Typography>
                      <Button size="small" onClick={() => navigate(`/offers/${app.oferta_id}`)}>{t("view_offer")}</Button>
                    </Card>
                  ))}
                </Stack>
              )}
            </>
          )}

          {profile.tipo_usuario === 'ofertante' || profile.tipo_usuario === 'agencia' ? (
            <>
              <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>{t("my_offers_title", "Mis Ofertas")}</Typography>
              {isLoadingOffers ? (
                <CircularProgress />
              ) : isErrorOffers ? (
                <Alert severity="error">{errorOffers.message || t("error_loading_offers", "Error al cargar las ofertas.")}</Alert>
              ) : (
                <MyOffersList userId={userId} isOwnProfile={isMyProfile} isAdmin={currentUser?.isAdmin} />
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      {selectedVideoToPlay && (
        <VideoPlayerModal open={showVideoPlayerModal} onClose={handleCloseVideoPlayer} youtubeUrl={selectedVideoToPlay.youtube_url} />
      )}

      {showVideoFormModal && (
        <VideoFormModal open={showVideoFormModal} onClose={handleCloseVideoForm} video={videoToEdit} onSave={handleVideoSaved} />
      )}

      {showEditProfileModal && profile && (
        <Modal open={showEditProfileModal} onClose={handleCloseEditProfileModal} aria-labelledby="edit-profile-modal-title" aria-describedby="edit-profile-modal-description">
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: '70%', md: '50%' }, bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '90vh', overflowY: 'auto', borderRadius: 2 }}>
            <EditProfileForm profileData={profile} onSave={handleProfileSaved} onCancel={handleCloseEditProfileModal} />
          </Box>
        </Modal>
      )}
    </Stack>
  );
}

export default ProfilePage;