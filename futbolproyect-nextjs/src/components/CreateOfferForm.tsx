"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FileUpload from "@/components/FileUpload";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";

// 1. Definimos la interfaz para las props (OPCIONALES)
interface CreateOfferProps {
  onOfferCreated?: () => void; // El signo ? hace que no sea obligatorio pasarlo
  onClose?: () => void; // El signo ? hace que no sea obligatorio pasarlo
}

const fetchOffer = async (offerId: string) => {
  const { data } = await apiClient.get(`/offers/${offerId}`);
  return data;
};

// 2. Aplicamos la interfaz al componente
function CreateOfferForm({ onOfferCreated, onClose }: CreateOfferProps) {
  const { t, ready } = useTranslation("common");
  const params = useParams();
  const offerId = params?.offerId as string | undefined;
  const router = useRouter();
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

  // Tipado correcto para arrays de archivos y strings
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!ready) {
    return <LoadingSpinner text={t("loading_offer", "Cargando oferta...")} />;
  }

  const { data: existingOffer, isLoading: isLoadingOffer } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: () => fetchOffer(offerId),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && existingOffer) {
      const {
        titulo,
        descripcion,
        ubicacion,
        puesto,
        salario,
        nivel,
        horarios,
        detalles_adicionales,
        imagen_url,
      } = existingOffer;
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
      if (imagen_url) {
        setImagePreview(imagen_url);
      }
    }
  }, [isEditMode, existingOffer]);

  useEffect(() => {
    let objectUrl: string;
    if (files.length > 0) {
      const file = files[0];
      objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    } else if (isEditMode && existingOffer?.imagen_url) {
      setImagePreview(existingOffer.imagen_url);
    } else {
      setImagePreview(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [files, isEditMode, existingOffer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploadProgress(0);
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      // @ts-ignore
      data.append(key, formData[key]);
    });

    if (files.length > 0) {
      data.append("imagen_url", files[0]);
    }

    const config = {
      onUploadProgress: (progressEvent: any) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        setUploadProgress(percentCompleted);
      },
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/offers/${offerId}`, data, config);
        setSuccess(t("offer_updated_success", "Oferta actualizada con éxito."));
      } else {
        await apiClient.post("/offers", data, config);
        setSuccess(t("offer_published_success", "Oferta publicada con éxito."));
      }

      if (onOfferCreated) {
        onOfferCreated();
      }
      setTimeout(() => {
        // Redirigir a la página de detalle o listado
        router.push(isEditMode ? `/offers/${offerId}` : "/offers");
      }, 1500);
    } catch (err: any) {
      console.error("Error completo:", err);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("error_processing_offer", "Error al procesar la oferta."),
      );
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  if (isLoadingOffer) {
    return <LoadingSpinner text={t("loading_offer", "Cargando oferta...")} />;
  }

  return (
    <Box sx={{ maxWidth: "600px", margin: "auto", p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isEditMode
          ? t("edit_offer_title", "Editar Oferta")
          : t("create_offer_title", "Crear Oferta")}
      </Typography>
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            name="titulo"
            label={t("offer_title_placeholder", "Título de la Oferta")}
            value={formData.titulo}
            onChange={handleChange}
            required
            fullWidth
            inputProps={{ minLength: 5, maxLength: 100 }}
            helperText={t(
              "titulo_helper_text",
              "El título debe tener entre 5 y 100 caracteres.",
            )}
          />
          <TextField
            name="descripcion"
            label={t(
              "offer_description_placeholder",
              "Descripción de la Oferta",
            )}
            value={formData.descripcion}
            onChange={handleChange}
            required
            fullWidth
            multiline
            rows={4}
            inputProps={{ minLength: 20 }}
            helperText={t(
              "descripcion_helper_text",
              "La descripción debe tener al menos 20 caracteres.",
            )}
          />
          <TextField
            name="ubicacion"
            label={t("location_placeholder", "Ubicación")}
            value={formData.ubicacion}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="puesto"
            label={t("position_placeholder", "Puesto")}
            value={formData.puesto}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="salario"
            label={t("salary_placeholder", "Salario")}
            value={formData.salario}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            name="nivel"
            label={t("select_level_placeholder", "Seleccionar Nivel")}
            value={formData.nivel}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">
              {t("select_level_placeholder", "Seleccionar Nivel")}
            </MenuItem>
            <MenuItem value="Profesional">
              {t("level_professional", "Profesional")}
            </MenuItem>
            <MenuItem value="Semi-Profesional">
              {" "}
              {/* Corregido el valor para coincidir con backend */}
              {t("level_semi_professional", "Semi-Profesional")}
            </MenuItem>
            <MenuItem value="Amateur">{t("level_amateur", "Amateur")}</MenuItem>
          </TextField>
          <TextField
            name="horarios"
            label={t("schedule_placeholder", "Horarios")}
            value={formData.horarios}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="detalles_adicionales"
            label={t("additional_details_placeholder", "Detalles Adicionales")}
            value={formData.detalles_adicionales}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          <FileUpload
            onFilesChange={setFiles}
            uploadProgress={uploadProgress}
            multiple={false}
            // @ts-ignore
            initialFiles={
              existingOffer?.imagen_url
                ? [{ preview: existingOffer.imagen_url, name: "current_image" }]
                : []
            }
          />

          {imagePreview && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="subtitle2">
                {t("image_preview", "Vista Previa de la Imagen")}
              </Typography>
              <Image
                src={imagePreview}
                alt={t("offer_image_preview", "Imagen de la Oferta")}
                width={300}
                height={200}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "300px",
                  objectFit: "contain",
                  marginTop: "8px",
                }}
              />
            </Box>
          )}

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ pt: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? t("updating...", "Actualizando...")
                  : t("publishing...", "Publicando...")
                : isEditMode
                  ? t("update_offer_button", "Actualizar Oferta")
                  : t("publish_offer_button", "Publicar Oferta")}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => router.back()}
              type="button"
              disabled={isSubmitting}
            >
              {t("cancel_button", "Cancelar")}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}

export default CreateOfferForm;
