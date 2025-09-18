import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import FileUpload from "./FileUpload";
import LoadingSpinner from "./LoadingSpinner";

const fetchOffer = async (offerId) => {
  const { data } = await apiClient.get(`/offers/${offerId}`);
  return data;
};

function CreateOffer({ onOfferCreated, onClose }) {
  const { t } = useTranslation();
  const { offerId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(offerId);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    puesto: "",
    salario: "",
    nivel: "",
    horarios: "",
    detalles_adicionales: "",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: existingOffer, isLoading: isLoadingOffer } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: () => fetchOffer(offerId),
    enabled: isEditMode, // Solo se ejecuta si estamos en modo edición
  });

  useEffect(() => {
    if (isEditMode && existingOffer) {
      const { titulo, descripcion, ubicacion, puesto, salario, nivel, horarios, detalles_adicionales } = existingOffer;
      setFormData({
        titulo: titulo || "",
        descripcion: descripcion || "",
        ubicacion: ubicacion || "",
        puesto: puesto || "",
        salario: salario || "",
        nivel: nivel || "",
        horarios: horarios || "",
        detalles_adicionales: detalles_adicionales || "",
      });
    }
  }, [isEditMode, existingOffer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploadProgress(0);
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (files.length > 0) {
      data.append('imagen_url', files[0]);
    }

    const config = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      },
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/offers/${offerId}`, data, config);
        setSuccess(t("offer_updated_success"));
      } else {
        await apiClient.post("/offers", data, config);
        setSuccess(t("offer_published_success"));
      }
      
      if (onOfferCreated) {
        onOfferCreated();
      }
      setTimeout(() => {
        navigate(isEditMode ? `/offers/${offerId}` : '/offers');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || t("error_processing_offer"));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  if (isLoadingOffer) {
    return <LoadingSpinner />;
  }

  return (
    <div className="form-card create-offer-card" style={{ width: '420px', margin: 'auto' }}>
      <h2>{isEditMode ? t("edit_offer_title") : t("create_offer_title")}</h2>
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            name="titulo"
            label={t("offer_title_placeholder")}
            value={formData.titulo}
            onChange={handleChange}
            required
            fullWidth
            inputProps={{ minLength: 5, maxLength: 100 }}
            helperText={t("titulo_helper_text")}
          />
          <TextField
            name="descripcion"
            label={t("offer_description_placeholder")}
            value={formData.descripcion}
            onChange={handleChange}
            required
            fullWidth
            multiline
            rows={4}
            inputProps={{ minLength: 20 }}
            helperText={t("descripcion_helper_text")}
          />
          <TextField name="ubicacion" label={t("location_placeholder")} value={formData.ubicacion} onChange={handleChange} fullWidth />
          <TextField name="puesto" label={t("position_placeholder")} value={formData.puesto} onChange={handleChange} fullWidth />
          <TextField name="salario" label={t("salary_placeholder")} value={formData.salario} onChange={handleChange} fullWidth />
          <TextField select name="nivel" label={t("select_level_placeholder")} value={formData.nivel} onChange={handleChange} fullWidth>
            <MenuItem value="">{t("select_level_placeholder")}</MenuItem>
            <MenuItem value="Profesional">{t("level_professional")}</MenuItem>
            <MenuItem value="Semi-profesional">{t("level_semi_professional")}</MenuItem>
            <MenuItem value="Amateur">{t("level_amateur")}</MenuItem>
          </TextField>
          <TextField name="horarios" label={t("schedule_placeholder")} value={formData.horarios} onChange={handleChange} fullWidth />
          <TextField name="detalles_adicionales" label={t("additional_details_placeholder")} value={formData.detalles_adicionales} onChange={handleChange} fullWidth multiline rows={3} />
          
          <FileUpload onFilesChange={setFiles} uploadProgress={uploadProgress} />

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? t("updating...") : t("publishing...")) : (isEditMode ? t("update_offer_button") : t("publish_offer_button"))}
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => navigate(-1)} type="button" disabled={isSubmitting}>
              {t("cancel_button")}
            </Button>
          </Stack>
        </Stack>
      </form>
    </div>
  );
}

export default CreateOffer;