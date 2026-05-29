"use client";

import React, { useCallback, useEffect, useState } from "react";
import Slider from "react-slick";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import { ScoutingReport } from "@/lib/types";

interface ScoutingReportsSectionProps {
  userId: string | number;
  isMyProfile: boolean;
}

const fetchScoutingReports = async (
  userId: string | number,
): Promise<ScoutingReport[]> => {
  const { data } = await apiClient.get(`/profiles/${userId}/scouting-reports`);
  return data;
};

export default function ScoutingReportsSection({
  userId,
  isMyProfile,
}: ScoutingReportsSectionProps) {
  const { t } = useTranslation("common");
  const [reports, setReports] = useState<ScoutingReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [expandedReports, setExpandedReports] = useState<Record<number, boolean>>({});

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchScoutingReports(userId);
      setReports(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTitle("");
    setDescription("");
    setFiles([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles.slice(0, 15));
  };

  const handleSubmit = async () => {
    if (!title.trim() || files.length === 0) {
      setError(
        t(
          "scouting_report_required_fields",
          "Agrega un título y al menos una imagen para crear el informe.",
        ),
      );
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      files.forEach((file) => formData.append("images", file));

      await apiClient.post(`/profiles/${userId}/scouting-reports`, formData);
      await loadReports();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (
      !window.confirm(
        t(
          "confirm_delete_scouting_report",
          "¿Seguro que querés eliminar este informe de scouting?",
        ),
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/profiles/${userId}/scouting-reports/${reportId}`);
      await loadReports();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 350,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5">
            {t("scouting_reports_title", "Informes de scouting")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(
              "scouting_reports_subtitle",
              "Cada jugador puede mostrar hasta 3 informes, con un carrusel de hasta 15 imágenes por informe.",
            )}
          </Typography>
        </Box>

        {isMyProfile && reports.length < 3 && (
          <Button
            variant="contained"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            {t("add_scouting_report", "Agregar informe")}
          </Button>
        )}
      </Stack>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : reports.length === 0 ? (
        <Typography color="text.secondary">
          {t("no_scouting_reports", "Aún no hay informes de scouting cargados.")}
        </Typography>
      ) : (
        <Stack spacing={3}>
          {reports.map((report) => {
            const isExpanded = Boolean(expandedReports[report.id]);
            const shouldShowToggle = (report.description || "").length > 160;

            return (
              <Paper
                key={report.id}
                variant="outlined"
                sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2 }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {report.title}
                      </Typography>
                      {report.description && (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={
                              isExpanded
                                ? { mt: 0.5, whiteSpace: "pre-line" }
                                : {
                                    mt: 0.5,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    whiteSpace: "pre-line",
                                  }
                            }
                          >
                            {report.description}
                          </Typography>
                          {shouldShowToggle && (
                            <Button
                              size="small"
                              endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              onClick={() =>
                                setExpandedReports((prev) => ({
                                  ...prev,
                                  [report.id]: !isExpanded,
                                }))
                              }
                              sx={{ mt: 0.5, px: 0 }}
                            >
                              {isExpanded
                                ? t("see_less", "Ver menos")
                                : t("see_more", "Ver más")}
                            </Button>
                          )}
                        </>
                      )}
                    </Box>

                    {isMyProfile && (
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(report.id)}
                        aria-label={t("delete", "Eliminar")}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>

                  <Box sx={{ px: { xs: 0, sm: 4 } }}>
                    <Slider {...sliderSettings}>
                      {report.images.map((image) => (
                        <Box key={image.id}>
                          <Box
                            sx={{
                              height: { xs: 260, md: 520 },
                              bgcolor: "#f5f5f5",
                              borderRadius: 1,
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={image.url}
                              alt={`${report.title} - ${image.position}`}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Slider>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t("add_scouting_report", "Agregar informe")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("scouting_report_title_label", "Título")}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              inputProps={{ maxLength: 150 }}
              required
              fullWidth
            />
            <TextField
              label={t("scouting_report_description_label", "Descripción")}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              rows={4}
              fullWidth
            />
            <Button variant="outlined" component="label">
              {t("select_scouting_images", "Seleccionar imágenes")}
              <input
                hidden
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              {t("scouting_images_counter", `${files.length} de 15 imágenes seleccionadas`).replace(
                "{{count}}",
                String(files.length),
              )}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isUploading}>
            {t("cancel", "Cancelar")}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isUploading}>
            {isUploading
              ? t("uploading", "Subiendo...")
              : t("save", "Guardar")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
