"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import { Profile } from "@/lib/types";
import EditProfileModal from "./EditProfileModal";
import { getProfilePath } from "@/lib/seoSlugs";

const emptyManagedProfile: Profile = {
  id: "",
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  nacionalidad: "",
  nacionalidad_en: "",
  posicion_principal: "",
  posicion_principal_en: "",
  altura_cm: 0,
  peso_kg: 0,
  pie_dominante: "",
  pie_dominante_en: "",
  resumen_profesional: "",
  resumen_profesional_en: "",
  idiomas: "",
  estadisticas: "",
  trayectoria: "",
  disponibilidad: "",
  foto_perfil_url: "",
  cv_url: "",
  linkedin_url: "",
  instagram_url: "",
  youtube_url: "",
  transfermarkt_url: "",
  whatsapp_url: "",
  tipo_usuario: "postulante",
  subscription_status: "inactiva",
  subscription_plan: "",
  subscription_end_date: "",
  average_rating: 0,
  total_ratings: 0,
  fecha_de_nacimiento: "",
  is_managed_profile: true,
};

export default function ManagedPlayerProfilesSection() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedManagedId = useMemo(() => {
    if (!selectedProfile?.id) return "";
    return String(selectedProfile.id).replace("managed-", "");
  }, [selectedProfile]);

  const loadProfiles = async () => {
    try {
      setError("");
      const { data } = await apiClient.get("/profiles/managed/me");
      setProfiles(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("managed_profiles_load_error", "No se pudieron cargar los perfiles gestionados."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleCreate = () => {
    setIsCreating(true);
    setSelectedProfile(emptyManagedProfile);
  };

  const handleEdit = (profile: Profile) => {
    setIsCreating(false);
    setSelectedProfile(profile);
  };

  const handleClose = () => {
    setSelectedProfile(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    handleClose();
    setLoading(true);
    await loadProfiles();
  };

  const handleDelete = async (profile: Profile) => {
    const profileName = `${profile.nombre} ${profile.apellido || ""}`.trim();
    const confirmed = window.confirm(
      t(
        "confirm_delete_managed_profile",
        `¿Seguro que querés eliminar el perfil de ${profileName}? Esta acción no se puede deshacer.`,
      ),
    );

    if (!confirmed) return;

    try {
      setError("");
      const managedId = String(profile.id).replace("managed-", "");
      await apiClient.delete(`/profiles/managed/${managedId}`);
      setProfiles((current) => current.filter((item) => item.id !== profile.id));
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("managed_profile_delete_error", "No se pudo eliminar el perfil."),
      );
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6">
                {t("managed_player_profiles_title", "Perfiles de jugadores")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(
                  "managed_player_profiles_subtitle",
                  "Cargá y editá los perfiles de tus jugadores desde esta cuenta.",
                )}
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              {t("add_profile", "Agregar perfil")}
            </Button>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Stack alignItems="center" sx={{ py: 3 }}>
              <CircularProgress />
            </Stack>
          ) : profiles.length === 0 ? (
            <Alert severity="info">
              {t("managed_profiles_empty", "Todavía no cargaste perfiles de jugadores.")}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {profiles.map((profile) => (
                <Grid item xs={12} md={6} key={profile.id}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <img
                          src={profile.foto_perfil_url || "/images/logos/logofp.png"}
                          alt={`${profile.nombre} ${profile.apellido || ""}`.trim()}
                          width="64"
                          height="64"
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {profile.nombre} {profile.apellido || ""}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {profile.posicion_principal || t("not_specified", "No especificada")}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: 2 }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(profile)}
                        >
                          {t("edit", "Editar")}
                        </Button>
                        <Button
                          size="small"
                          component={Link}
                          href={getProfilePath(profile)}
                          startIcon={<OpenInNewIcon />}
                        >
                          {t("view_profile", "Ver Perfil")}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(profile)}
                        >
                          {t("delete", "Eliminar")}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {selectedProfile && (
        <EditProfileModal
          open={Boolean(selectedProfile)}
          onClose={handleClose}
          profileData={selectedProfile}
          onSave={handleSave}
          saveEndpoint={
            isCreating ? "/profiles/managed" : `/profiles/managed/${selectedManagedId}`
          }
          saveMethod={isCreating ? "post" : "put"}
          title={
            isCreating
              ? t("create_managed_profile_title", "Agregar perfil de jugador")
              : t("edit_managed_profile_title", "Editar perfil de jugador")
          }
          submitLabel={
            isCreating
              ? t("create_profile_button", "Crear perfil")
              : t("save_changes_button", "Guardar Cambios")
          }
          showEmailField
        />
      )}
    </Box>
  );
}
