"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Button,
  Stack,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { UserPhoto } from "@/lib/types";
import FileUpload from "@/components/ui/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import Image from "next/image";
import apiClient from "@/lib/apiClient";

// CORRECCIÓN: userId ahora acepta string | number
interface UserPhotosSectionProps {
  userId: string | number;
  isMyProfile: boolean;
}

// CORRECCIÓN: fetchUserPhotos acepta string | number
const fetchUserPhotos = async (
  userId: string | number,
): Promise<UserPhoto[]> => {
  const { data } = await apiClient.get(`/profiles/${userId}/photos`);
  return data;
};

const uploadPhoto = async ({
  userId,
  file,
  title,
}: {
  userId: string | number;
  file: File;
  title: string;
}) => {
  const formData = new FormData();
  formData.append("photo", file);
  formData.append("title", title);

  const { data } = await apiClient.post(`/profiles/${userId}/photos`, formData);
  return data;
};

const deletePhoto = async ({
  userId,
  photoId,
}: {
  userId: string | number;
  photoId: number;
}) => {
  const { data } = await apiClient.delete(
    `/profiles/${userId}/photos/${photoId}`,
  );
  return data;
};

export default function UserPhotosSection({
  userId,
  isMyProfile,
}: UserPhotosSectionProps) {
  const { t, i18n } = useTranslation();
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedPhotoToView, setSelectedPhotoToView] =
    useState<UserPhoto | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserPhotos(userId);
      setPhotos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length > 0) {
        if (photos.length >= 5) {
          alert(t("max_photos_reached", "You can only upload up to 5 photos."));
          return;
        }
        setIsUploading(true);
        try {
          await uploadPhoto({ userId, file: files[0], title: photoTitle });
          await loadPhotos(); // Refresh list
          setShowPhotoUpload(false);
          setPhotoTitle("");
        } catch (err: any) {
          alert(err.message);
        } finally {
          setIsUploading(false);
        }
      }
    },
    [userId, photos, loadPhotos, t, photoTitle],
  );

  const handleDeletePhoto = async (photoId: number) => {
    if (
      window.confirm(
        t(
          "confirm_delete_photo",
          "Are you sure you want to delete this photo?",
        ),
      )
    ) {
      try {
        await deletePhoto({ userId, photoId });
        await loadPhotos(); // Refresh list
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleOpenPhotoView = (photo: UserPhoto) =>
    setSelectedPhotoToView(photo);
  const handleClosePhotoView = () => setSelectedPhotoToView(null);

  const lang = i18n.language;

  return (
    <Stack sx={{ mt: 4, mb: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t("profile_photos_title", "Fotos del Perfil")}
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : photos.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("no_user_photos", "Aún no hay fotos cargadas por el usuario.")}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {photos.map((photo) => {
            const title = photo[`title_${lang}`] || photo.title;
            return (
              <Grid item key={photo.id} xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: 150,
                    overflow: "hidden",
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover .delete-button": { opacity: 1 },
                  }}
                  onClick={() => handleOpenPhotoView(photo)}
                >
                  <Image
                    src={photo.url}
                    alt={title}
                    layout="fill"
                    objectFit="contain"
                  />
                  {isMyProfile && (
                    <IconButton
                      color="error"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 1)",
                        },
                      }}
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  display="block"
                  gutterBottom
                  noWrap
                >
                  {title}
                </Typography>
              </Grid>
            );
          })}
          {isMyProfile && photos.length < 5 && !showPhotoUpload && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<AddPhotoAlternateIcon />}
                onClick={() => setShowPhotoUpload(true)}
                sx={{ mt: 1 }}
              >
                {t("add_photo", "Añadir Foto")}
              </Button>
            </Grid>
          )}
        </Grid>
      )}

      {isMyProfile && showPhotoUpload && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t("upload_new_photo", "Subir nueva foto")}
          </Typography>
          <TextField
            label={t("photo_title", "Título de la foto")}
            value={photoTitle}
            onChange={(e) => setPhotoTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FileUpload onFilesChange={handleFileUpload} multiple={false} />
          {isUploading && <CircularProgress size={24} sx={{ mt: 1 }} />}
          <Button onClick={() => setShowPhotoUpload(false)} sx={{ mt: 1 }}>
            {t("cancel", "Cancelar")}
          </Button>
        </Box>
      )}

      <Dialog
        open={!!selectedPhotoToView}
        onClose={handleClosePhotoView}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { maxWidth: '70vw', maxHeight: '70vh' } }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          {selectedPhotoToView && (
            <img
              src={selectedPhotoToView.url}
              alt={
                selectedPhotoToView[`title_${lang}`] ||
                selectedPhotoToView.title
              }
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "scale-down" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhotoView}>{t("close", "Cerrar")}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
