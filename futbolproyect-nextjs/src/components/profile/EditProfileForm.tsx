'use client';

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, TextField, Button, Alert, Divider, Typography, Card, CardContent, CircularProgress, MenuItem } from "@mui/material";
import { Profile } from "@/lib/types";
import apiClient from "@/lib/apiClient";
import {
  getPlayerPositionCategory,
  PLAYER_POSITION_OPTIONS,
} from "@/lib/profilePositions";

interface EditProfileFormProps {
    profileData: Profile;
    onSave: () => void;
    onCancel: () => void;
    saveEndpoint?: string;
    saveMethod?: "post" | "put";
    title?: string;
    submitLabel?: string;
    showEmailField?: boolean;
}

interface StatsFormData {
  temporada: string;
  partidos: string;
  minutos: string;
  goles: string;
  asistencias: string;
}

interface CareerRow {
  year: string;
  club: string;
  league: string;
  country: string;
}

const emptyStatsForm: StatsFormData = {
  temporada: "",
  partidos: "",
  minutos: "",
  goles: "",
  asistencias: "",
};

const emptyCareerRow: CareerRow = {
  year: "",
  club: "",
  league: "",
  country: "",
};

const parseStatsForm = (value?: string | null): StatsFormData => {
  if (!value) return emptyStatsForm;

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        temporada: String(parsed.temporada || ""),
        partidos: String(parsed.partidos || ""),
        minutos: String(parsed.minutos || ""),
        goles: String(parsed.goles || ""),
        asistencias: String(parsed.asistencias || ""),
      };
    }
  } catch {
    // Keep compatibility with the previous free-text format.
  }

  const stats = { ...emptyStatsForm };
  value
    .split(/\r?\n/)
    .map((line) => line.split("|").map((part) => part.trim()))
    .forEach(([amount, label, detail]) => {
      const normalizedLabel = (label || "").toLowerCase();
      if (detail && !stats.temporada) stats.temporada = detail.replace(/^temporada\s*/i, "");
      if (normalizedLabel.includes("partido")) stats.partidos = amount || "";
      if (normalizedLabel.includes("minuto")) stats.minutos = amount || "";
      if (normalizedLabel.includes("gol")) stats.goles = amount || "";
      if (normalizedLabel.includes("asistencia")) stats.asistencias = amount || "";
    });

  return stats;
};

const parseCareerRows = (value?: string | null): CareerRow[] => {
  if (!value) return [{ ...emptyCareerRow }];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const rows = parsed.map((row) => ({
        year: String(row.year || ""),
        club: String(row.club || ""),
        league: String(row.league || row.category || ""),
        country: String(row.country || ""),
      }));
      return rows.length > 0 ? rows : [{ ...emptyCareerRow }];
    }
  } catch {
    // Keep compatibility with the previous free-text format.
  }

  const rows = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.includes("|")
        ? line.split("|").map((part) => part.trim())
        : line.split(" - ").map((part) => part.trim());

      return {
        year: parts[0] || "",
        club: parts[1] || "",
        league: parts[2] || "",
        country: parts[3] || "",
      };
    });

  return rows.length > 0 ? rows : [{ ...emptyCareerRow }];
};

const EditProfileForm = ({
  profileData,
  onSave,
  onCancel,
  saveEndpoint = "/profiles/me",
  saveMethod = "put",
  title,
  submitLabel,
  showEmailField = false,
}: EditProfileFormProps) => {
  const { t } = useTranslation();
  
  const formatDateForInput = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    nombre: profileData.nombre || "",
    apellido: profileData.apellido || "",
    email: profileData.email || "",
    telefono: profileData.telefono || "",
    nacionalidad: profileData.nacionalidad || "",
    posicion_principal: getPlayerPositionCategory(profileData.posicion_principal),
    resumen_profesional: profileData.resumen_profesional || "",
    cv_url: profileData.cv_url || "",
    linkedin_url: profileData.linkedin_url || "",
    instagram_url: profileData.instagram_url || "",
    youtube_url: profileData.youtube_url || "",
    transfermarkt_url: profileData.transfermarkt_url || "",
    whatsapp_url: profileData.whatsapp_url || "",
    agente_nombre: profileData.agente_nombre || "",
    agente_contacto: profileData.agente_contacto || "",
    altura_cm: profileData.altura_cm || "",
    peso_kg: profileData.peso_kg || "",
    pie_dominante: profileData.pie_dominante || "",
    fecha_de_nacimiento: formatDateForInput(profileData.fecha_de_nacimiento),
    idiomas: profileData.idiomas || "",
    estadisticas: profileData.estadisticas || "",
    trayectoria: profileData.trayectoria || "",
    disponibilidad: profileData.disponibilidad || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(Boolean(profileData.whatsapp_url));
  const [statsForm, setStatsForm] = useState<StatsFormData>(() => parseStatsForm(profileData.estadisticas));
  const [careerRows, setCareerRows] = useState<CareerRow[]>(() => parseCareerRows(profileData.trayectoria));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        setSelectedFile(event.target.files[0]);
    }
  };

  const handleStatsChange = (field: keyof StatsFormData, value: string) => {
    setStatsForm((current) => ({ ...current, [field]: value }));
  };

  const handleCareerChange = (index: number, field: keyof CareerRow, value: string) => {
    setCareerRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    );
  };

  const handleAddCareerRow = () => {
    setCareerRows((current) => [...current, { ...emptyCareerRow }]);
  };

  const handleRemoveCareerRow = (index: number) => {
    setCareerRows((current) => {
      const nextRows = current.filter((_, rowIndex) => rowIndex !== index);
      return nextRows.length > 0 ? nextRows : [{ ...emptyCareerRow }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanedCareerRows = careerRows.filter((row) =>
      Object.values(row).some((value) => value.trim()),
    );
    const payload = {
      ...formData,
      estadisticas: JSON.stringify(statsForm),
      trayectoria: JSON.stringify(cleanedCareerRows),
    };

    const data = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
        data.append(key, value == null ? "" : String(value));
    });
    if (selectedFile) {
      data.append("foto_perfil", selectedFile);
    }

    try {
        const response =
          saveMethod === "post"
            ? await apiClient.post(saveEndpoint, data)
            : await apiClient.put(saveEndpoint, data);

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
        <Typography variant="h5" sx={{ mb: 2 }}>{title || t("edit_profile_title", "Editar Perfil")}</Typography>
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
            {showEmailField && (
              <TextField name="email" label={t("email_label", "Email")} value={formData.email} onChange={handleChange} fullWidth />
            )}
            <TextField type="date" name="fecha_de_nacimiento" label={t("birth_date_placeholder")} value={formData.fecha_de_nacimiento} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField name="nacionalidad" label={t("nationality_placeholder")} value={formData.nacionalidad} onChange={handleChange} fullWidth />
            <TextField name="telefono" label={t("contact_phone_placeholder")} value={formData.telefono} onChange={handleChange} fullWidth />
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">{t("sport_data_title", "Datos Deportivos")}</Typography>
            <TextField
              name="posicion_principal"
              label={t("main_position_placeholder")}
              value={formData.posicion_principal}
              onChange={handleChange}
              select
              fullWidth
              helperText={t(
                "main_position_select_help",
                "Elegí una de estas categorías para que los filtros funcionen mejor.",
              )}
            >
              <MenuItem value="">
                {t("select_position_placeholder", "Selecciona una posición")}
              </MenuItem>
              {PLAYER_POSITION_OPTIONS.map((position) => (
                <MenuItem key={position.value} value={position.value}>
                  {t(position.labelKey, position.fallback)}
                </MenuItem>
              ))}
            </TextField>
            <TextField type="number" name="altura_cm" label={t("height_placeholder")} value={formData.altura_cm} onChange={handleChange} fullWidth />
            <TextField type="number" name="peso_kg" label={t("weight_placeholder")} value={formData.peso_kg} onChange={handleChange} fullWidth />
            <TextField name="pie_dominante" label={t("dominant_foot_placeholder")} value={formData.pie_dominante} onChange={handleChange} fullWidth />
            <TextField name="idiomas" label={t("languages_placeholder", "Idiomas")} value={formData.idiomas} onChange={handleChange} fullWidth helperText={t("languages_help", "Ej. Espanol nativo, Ingles intermedio, Portugues basico")} />
            <TextField
              name="disponibilidad"
              label={t("availability_placeholder", "Disponibilidad")}
              value={formData.disponibilidad}
              onChange={handleChange}
              select
              fullWidth
            >
              <MenuItem value="">{t("not_specified", "No especificada")}</MenuItem>
              <MenuItem value="Disponible">{t("available_status", "Disponible")}</MenuItem>
              <MenuItem value="Libre">{t("free_agent_status", "Libre")}</MenuItem>
              <MenuItem value="Con contrato">{t("under_contract_status", "Con contrato")}</MenuItem>
              <MenuItem value="A prueba">{t("trial_status", "A prueba")}</MenuItem>
            </TextField>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">{t("profile_sections_title", "Secciones del Perfil")}</Typography>
            <Typography variant="subtitle2">{t("stats_placeholder", "Estadisticas")}</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField name="temporada" label={t("season_label", "Temporada")} value={statsForm.temporada} onChange={(event) => handleStatsChange("temporada", event.target.value)} fullWidth />
              <TextField type="number" name="partidos" label={t("matches_label", "Partidos")} value={statsForm.partidos} onChange={(event) => handleStatsChange("partidos", event.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField type="number" name="minutos" label={t("minutes_label", "Minutos")} value={statsForm.minutos} onChange={(event) => handleStatsChange("minutos", event.target.value)} fullWidth />
              <TextField type="number" name="goles" label={t("goals_label", "Goles")} value={statsForm.goles} onChange={(event) => handleStatsChange("goles", event.target.value)} fullWidth />
              <TextField type="number" name="asistencias" label={t("assists_label", "Asistencias")} value={statsForm.asistencias} onChange={(event) => handleStatsChange("asistencias", event.target.value)} fullWidth />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" spacing={2}>
              <Typography variant="subtitle2">{t("career_path_placeholder", "Trayectoria deportiva / clubes")}</Typography>
              <Button type="button" variant="outlined" onClick={handleAddCareerRow}>
                {t("add_club_button", "Agregar club")}
              </Button>
            </Stack>
            <Stack spacing={2}>
              {careerRows.map((row, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField label={t("year_label", "Año")} value={row.year} onChange={(event) => handleCareerChange(index, "year", event.target.value)} fullWidth />
                        <TextField label={t("club_label", "Club")} value={row.club} onChange={(event) => handleCareerChange(index, "club", event.target.value)} fullWidth />
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField label={t("league_label", "Liga")} value={row.league} onChange={(event) => handleCareerChange(index, "league", event.target.value)} fullWidth />
                        <TextField label={t("country_label", "Pais")} value={row.country} onChange={(event) => handleCareerChange(index, "country", event.target.value)} fullWidth />
                      </Stack>
                      <Stack direction="row" justifyContent="flex-end">
                        <Button type="button" color="error" onClick={() => handleRemoveCareerRow(index)}>
                          {t("remove_club_button", "Eliminar club")}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">{t("summary_cv_title", "Resumen y CV")}</Typography>
            <TextField name="resumen_profesional" label={t("professional_summary_placeholder")} value={formData.resumen_profesional} onChange={handleChange} fullWidth multiline rows={4}/>
            <TextField name="cv_url" label={t("cv_url_placeholder")} value={formData.cv_url} onChange={handleChange} fullWidth />

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">{t("agent_data_title", "Datos del Agente")}</Typography>
            <TextField name="agente_nombre" label={t("agent_name_label", "Agente")} value={formData.agente_nombre} onChange={handleChange} fullWidth />
            <TextField name="agente_contacto" label={t("agent_contact_label", "Contacto Agente")} value={formData.agente_contacto} onChange={handleChange} fullWidth />

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">{t("social_networks_links_title", "Redes Sociales")}</Typography>
            <TextField name="linkedin_url" label={t("linkedin_placeholder")} value={formData.linkedin_url} onChange={handleChange} fullWidth />
            <TextField name="instagram_url" label={t("instagram_placeholder")} value={formData.instagram_url} onChange={handleChange} fullWidth />
            <TextField name="youtube_url" label={t("youtube_placeholder")} value={formData.youtube_url} onChange={handleChange} fullWidth />
            <TextField name="transfermarkt_url" label={t("website_placeholder", "Web / Transfermarkt")} value={formData.transfermarkt_url} onChange={handleChange} fullWidth />
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
                    {loading ? <CircularProgress size={24} /> : submitLabel || t("save_changes_button", "Guardar Cambios")}
                </Button>
            </Stack>
            </Stack>
        </form>
      </CardContent>
    </Card>
  );
}

export default EditProfileForm;
