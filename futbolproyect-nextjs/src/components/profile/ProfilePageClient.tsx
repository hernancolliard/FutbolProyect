'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { Paper, Typography, Alert, Stack, CircularProgress, Card, CardContent, Grid, Box, Button } from '@mui/material';
// import { useAuth } from '@/context/AuthContext'; // To be implemented

// Mock AuthContext for now
const useAuth = () => {
  // Replace with actual auth context once migrated
  const user = {
    id: 1, // Make it dynamic for testing 'isMyProfile'
    nombre: "MockUser",
    isadmin: true,
    tipo_usuario: "ofertante",
  };
  return { user };
};


interface ProfilePageClientProps {
    profile: Profile | null;
}

export default function ProfilePageClient({ profile }: ProfilePageClientProps) {
    const { t, i18n } = useTranslation();
    const { user: currentUser } = useAuth(); // Using mock auth

    // This effect would record a profile view. Needs API client.
    // useEffect(() => {
    //     if (profile && currentUser && profile.id !== currentUser.id) {
    //         const recordView = async () => {
    //             try {
    //                 // await apiClient.post(`/profiles/${profile.id}/view`);
    //             } catch (error) {
    //                 console.error("Failed to record profile view:", error);
    //             }
    //         };
    //         recordView();
    //     }
    // }, [profile, currentUser]);

    if (!currentUser) {
        return (
            <Stack alignItems="center" sx={{ mt: 4 }}>
                <Alert severity="warning">{t("must_be_logged_in_to_see_profile", "Debes iniciar sesión para ver este perfil.")}</Alert>
            </Stack>
        );
    }
    
    // The loading state should be handled by Suspense in the server component
    // but we add this for cases where profile is null after fetch fails
    if (!profile) {
        return <Alert severity="warning">{t("profile_not_found", "Perfil no encontrado o error al cargar.")}</Alert>;
    }
    
    const isMyProfile = currentUser && currentUser.id === profile.id;
    const lang = i18n.language;
    const nacionalidad = profile[`nacionalidad_${lang}`] || profile.nacionalidad;
    const posicion_principal = profile[`posicion_principal_${lang}`] || profile.posicion_principal;

    return (
        <Stack alignItems="center" sx={{ mt: 4 }}>
            <Card sx={{ maxWidth: 1350, width: "100%", p: {xs: 1, sm: 2, md: 3} }} elevation={3}>
                <CardContent>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                     <Stack
                                        direction="column"
                                        spacing={2}
                                        alignItems="center"
                                        sx={{ mb: 2 }}
                                    >
                                        {profile.foto_perfil_url ? (
                                            <Box sx={{ flexShrink: 0, cursor: 'pointer' }}>
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
                                        {isMyProfile && (
                                            <Button
                                            variant="contained"
                                            >
                                            {t("edit_profile_button", "Editar Perfil")}
                                            </Button>
                                        )}
                                        {/* ShareButtons component will go here */}
                                    </Stack>
                                </Grid>
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
                        </Grid>
                    </Grid>
import VideosSection from './VideosSection';
// ... (rest of the imports)

// ... (rest of the component before the return)

    return (
        <Stack alignItems="center" sx={{ mt: 4 }}>
            <Card sx={{ maxWidth: 1350, width: "100%", p: {xs: 1, sm: 2, md: 3} }} elevation={3}>
                <CardContent>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                     <Stack
                                        direction="column"
                                        spacing={2}
                                        alignItems="center"
                                        sx={{ mb: 2 }}
                                    >
                                        {profile.foto_perfil_url ? (
                                            <Box sx={{ flexShrink: 0, cursor: 'pointer' }}>
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
                                        {isMyProfile && (
                                            <Button
                                            variant="contained"
                                            >
                                            {t("edit_profile_button", "Editar Perfil")}
                                            </Button>
                                        )}
                                        {/* ShareButtons component will go here */}
                                    </Stack>
                                </Grid>
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
                        </Grid>
                    </Grid>
                    
                    <VideosSection userId={profile.id} isMyProfile={isMyProfile} />

                    {/* Placeholder for other sections */}
                    <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                        {t('stub_section_title', 'Más secciones (Fotos, etc.) vendrán aquí.')}
                    </Typography>
                </CardContent>
            </Card>
        </Stack>
    );
}
