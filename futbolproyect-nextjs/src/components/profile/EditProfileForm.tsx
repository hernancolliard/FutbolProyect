'use client';

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, TextField, Button, Alert, Divider, Typography, Card, CardContent, CircularProgress, Box } from "@mui/material";
import { Profile } from "@/lib/types";
import apiClient from "@/lib/apiClient";

interface EditProfileFormProps {
    profileData: Profile;
    onSave: () => void;
    onCancel: () => void;
}

const EditProfileForm = ({ profileData, onSave, onCancel }: EditProfileFormProps) => {
  const { t } = useTranslation();
  
  const formatDateForInput = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    nombre: profileData.nombre || "",
    apellido: profileData.apellido || "",
    telefono: profileData.telefono || "",
    nacionalidad: profileData.nacionalidad || "",
    posicion_principal: profileData.posicion_principal || "",
    resumen_profesional: profileData.resumen_profesional || "",
    cv_url: profileData.cv_url || "",
    linkedin_url: profileData.linkedin_url || "",
    instagram_url: profileData.instagram_url || "",
    youtube_url: profileData.youtube_url || "",
    transfermarkt_url: profileData.transfermarkt_url || "",
    whatsapp_url: profileData.whatsapp_url || "",
    altura_cm: profileData.altura_cm || "",
    peso_kg: profileData.peso_kg || "",
    pie_dominante: profileData.pie_dominante || "",
    fecha_de_nacimiento: formatDateForInput(profileData.fecha_de_nacimiento),
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(Boolean(profileData.whatsapp_url));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
        if(value) data.append(key, value as string);
    });
    if (selectedFile) {
      data.append("foto_perfil", selectedFile);
    }

    try {
        const response = await apiClient.put("/profiles/me", data);

        if (response.status !== 200 && response.status !== 201) {
          throw new Error(t("error_saving_profile", "Error al guardar el perfil"));
        }

        onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t("error_saving_profile", "Error al guardar el perfil"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 900, width: "100%" }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>{t("edit_profile_title", "Editar Perfil")}</Typography>
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <Typography variant="subtitle1" sx={{ mb: 1 }}>{t("profile_image", "Imagen de Perfil")}</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                {profileData.foto_perfil_url && <img src={profileData.foto_perfil_url} alt="Profile" width="80" height="80" style={{borderRadius: '50%'}}/>}
                <Button variant="outlined" component="label">
                    {t("select_file", "Seleccionar Archivo")}
                    <input type="file" name="foto_perfil" onChange={handleFileChange} hidden accept="image/*"/>
                </Button>
                {selectedFile && <Typography variant="caption">{selectedFile.name}</Typography>}
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">{t("personal_data_title", "Datos Personales")}</Typography>
            <TextField name="nombre" label={t("name_placeholder")} value={formData.nombre} onChange={handleChange} fullWidth />
            <TextField name="apellido" label={t("lastname_placeholder")} value={formData.apellido} onChange={handleChange} fullWidth />
            <TextField type="date" name="fecha_de_nacimiento" label={t("birth_date_placeholder")} value={formData.fecha_de_nacimiento} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField name="nacionalidad" label={t("nationality_placeholder")} value={formData.nacionalidad} onChange={handleChange} fullWidth />
            <TextField name="telefono" label={t("contact_phone_placeholder")} value={formData.telefono} onChange={handleChange} fullWidth />
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">{t("sport_data_title", "Datos Deportivos")}</Typography>
            <TextField name="posicion_principal" label={t("main_position_placeholder")} value={formData.posicion_principal} onChange={handleChange} fullWidth />
            <TextField type="number" name="altura_cm" label={t("height_placeholder")} value={formData.altura_cm} onChange={handleChange} fullWidth />
            <TextField type="number" name="peso_kg" label={t("weight_placeholder")} value={formData.peso_kg} onChange={handleChange} fullWidth />
            <TextField name="pie_dominante" label={t("dominant_foot_placeholder")} value={formData.pie_dominante} onChange={handleChange} fullWidth />

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">{t("summary_cv_title", "Resumen y CV")}</Typography>
            <TextField name="resumen_profesional" label={t("professional_summary_placeholder")} value={formData.resumen_profesional} onChange={handleChange} fullWidth multiline rows={4}/>
            <TextField name="cv_url" label={t("cv_url_placeholder")} value={formData.cv_url} onChange={handleChange} fullWidth />

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">{t("social_networks_links_title", "Redes Sociales")}</Typography>
            <TextField name="linkedin_url" label={t("linkedin_placeholder")} value={formData.linkedin_url} onChange={handleChange} fullWidth />
            <TextField name="instagram_url" label={t("instagram_placeholder")} value={formData.instagram_url} onChange={handleChange} fullWidth />
            <TextField name="youtube_url" label={t("youtube_placeholder")} value={formData.youtube_url} onChange={handleChange} fullWidth />
            <TextField name="transfermarkt_url" label={t("transfermarkt_placeholder")} value={formData.transfermarkt_url} onChange={handleChange} fullWidth />
            {showWhatsAppInput ? (
              <TextField
                name="whatsapp_url"
                label={t("whatsapp_placeholder", "WhatsApp")}
                value={formData.whatsapp_url}
                onChange={handleChange}
                fullWidth
                helperText={t("whatsapp_help", "Introduce tu enlace de WhatsApp (ej. https://wa.me/123456789)")}
              />
            ) : (
              <Button variant="outlined" onClick={() => setShowWhatsAppInput(true)}>
                {t("add_whatsapp_button", "Agregar WhatsApp")}
              </Button>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button type="button" onClick={onCancel} variant="outlined" disabled={loading}>{t("cancel_button", "Cancelar")}</Button>
                <Button type="submit" disabled={loading} variant="contained">
                    {loading ? <CircularProgress size={24} /> : t("save_changes_button", "Guardar Cambios")}
                </Button>
            </Stack>
            </Stack>
        </form>
      </CardContent>
    </Card>
  );
}

export default EditProfileForm;
