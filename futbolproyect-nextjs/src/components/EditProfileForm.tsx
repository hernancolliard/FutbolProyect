'use client';

import React, { useState } from "react";
import apiClient from '@/lib/apiClient';
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Image from "next/image"; // Import next/image

function EditProfileForm({ profileData, onSave, onCancel }) {
  const { t } = useTranslation('common');
  // Helper para formatear la fecha para el input type="date"
  const formatDateForInput = (date) => {
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
    altura_cm: profileData.altura_cm || "",
    peso_kg: profileData.peso_kg || "",
    pie_dominante: profileData.pie_dominante || "",
    fecha_de_nacimiento: formatDateForInput(profileData.fecha_de_nacimiento),
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (selectedFile) {
      data.append("foto_perfil", selectedFile);
    }

    try {
      await apiClient.put("/profiles/me", data);
      onSave();
    } catch (err) {
      setError(err.message || t("error_saving_profile", "Error al guardar el perfil."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 900, width: "100%", mt: 4, mx: "auto" }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {t("edit_profile_title", "Editar Perfil")}
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          sx={{ display: 'flex' }} // Added flex display for proper layout
        >
          <Stack
            alignItems="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography>{t("profile_image", "Imagen de Perfil")}</Typography>
            <Image
              src={selectedFile ? URL.createObjectURL(selectedFile) : (profileData.foto_perfil_url || '/images/logos/logofp.png')} // Show preview of new file or default
              alt={t('profile_picture_alt', { name: profileData.nombre })}
              width={150}
              height={150}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ccc",
              }}
            />
            <Button variant="outlined" component="label">
              {t("select_file", "Seleccionar Archivo")}
              <input
                id="file-upload"
                type="file"
                name="foto_perfil"
                onChange={handleFileChange}
                hidden
              />
            </Button>
            {selectedFile && (
              <Typography variant="caption">
                {t("file", "Archivo")}: {selectedFile.name}
              </Typography>
            )}
          </Stack>
          <form
            onSubmit={handleSubmit}
            style={{ flex: 1 }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t("personal_data_title", "Datos Personales")}
            </Typography>
            <Stack spacing={2}>
              <TextField
                type="text"
                name="nombre"
                label={t("name_placeholder", "Nombre")}
                value={formData.nombre}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="text"
                name="apellido"
                label={t("lastname_placeholder", "Apellido")}
                value={formData.apellido}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="date"
                name="fecha_de_nacimiento"
                label={t("birth_date_placeholder", "Fecha de Nacimiento")}
                value={formData.fecha_de_nacimiento}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="text"
                name="nacionalidad"
                label={t("nationality_placeholder", "Nacionalidad")}
                value={formData.nacionalidad}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="text"
                name="telefono"
                label={t("contact_phone_placeholder", "Teléfono de Contacto")}
                value={formData.telefono}
                onChange={handleChange}
                fullWidth
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">
                {t("sport_data_title", "Datos Deportivos")}
              </Typography>
              <TextField
                type="text"
                name="posicion_principal"
                label={t("main_position_placeholder", "Posición Principal")}
                value={formData.posicion_principal}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="number"
                name="altura_cm"
                label={t("height_placeholder", "Altura (cm)")}
                value={formData.altura_cm}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="number"
                name="peso_kg"
                label={t("weight_placeholder", "Peso (kg)")}
                value={formData.peso_kg}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="text"
                name="pie_dominante"
                label={t("dominant_foot_placeholder", "Pie Dominante")}
                value={formData.pie_dominante}
                onChange={handleChange}
                fullWidth
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">
                {t("summary_cv_title", "Resumen y CV")}
              </Typography>
              <TextField
                name="resumen_profesional"
                label={t("professional_summary_placeholder", "Resumen Profesional")}
                value={formData.resumen_profesional}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
              <TextField
                type="text"
                name="cv_url"
                label={t("cv_url_placeholder", "URL del CV")}
                value={formData.cv_url}
                onChange={handleChange}
                fullWidth
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">
                {t("social_networks_links_title", "Redes Sociales y Enlaces")}
              </Typography>
              <TextField
                type="text"
                name="linkedin_url"
                label={t("linkedin_placeholder", "LinkedIn URL")}
                value={formData.linkedin_url}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="text"
                name="instagram_url"
                label={t("instagram_placeholder", "Instagram URL")}
                value={formData.instagram_url}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="text"
                name="youtube_url"
                label={t("youtube_placeholder", "YouTube URL")}
                value={formData.youtube_url}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                type="text"
                name="transfermarkt_url"
                label={t("transfermarkt_placeholder", "Transfermarkt URL")}
                value={formData.transfermarkt_url}
                onChange={handleChange}
                fullWidth
              />
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                sx={{ mt: 2 }}
              >
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outlined"
                  color="secondary"
                >
                  {t("cancel_button", "Cancelar")}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  color="primary"
                >
                  {loading ? t("saving_button", "Guardando...") : t("save_changes_button", "Guardar Cambios")}
                </Button>
              </Stack>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default EditProfileForm;
