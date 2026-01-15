'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '@/lib/apiClient';
import FileUpload from './FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Image from 'next/image'; // Import next/image

// --- API Calls ---
const fetchUserPhotos = async (userId) => {
  const { data } = await apiClient.get(`/profiles/${userId}/photos`);
  return data;
};

const uploadPhoto = async ({ userId, file, title }) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('title', title);
  const { data } = await apiClient.post(`/profiles/${userId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const deletePhoto = async ({ userId, photoId }) => {
  const { data } = await apiClient.delete(`/profiles/${userId}/photos/${photoId}`);
  return data;
};

const UserPhotosSection = ({ userId, isMyProfile }) => {
  const { t, i18n } = useTranslation('common');
  const queryClient = useQueryClient();
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedPhotoToView, setSelectedPhotoToView] = useState(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);

  // Fetch photos
  const { data: userPhotos, isLoading, isError, error } = useQuery({
    queryKey: ['userPhotos', userId],
    queryFn: () => fetchUserPhotos(userId),
    initialData: [], // Ensure userPhotos is always an array
  });

  // Mutation for uploading photo
  const uploadPhotoMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: (newPhoto) => {
      toast.success(t('photo_upload_success', 'Foto subida con éxito.'));
      queryClient.setQueryData(['userPhotos', userId], (oldData) => {
        return oldData ? [...oldData, newPhoto] : [newPhoto];
      });
      setShowPhotoUpload(false);
      setPhotoTitle("");
      setFileToUpload(null);
    },
    onError: (err) => {
      toast.error(err.message || t('photo_upload_error', 'Error al subir la foto.'));
    },
  });

  // Mutation for deleting photo
  const deletePhotoMutation = useMutation({
    mutationFn: deletePhoto,
    onSuccess: (data, variables) => {
      toast.success(data.message || t('photo_delete_success', 'Foto eliminada con éxito.'));
      queryClient.setQueryData(['userPhotos', userId], (oldData) => {
        return oldData ? oldData.filter(photo => photo.id !== variables.photoId) : [];
      });
    },
    onError: (err) => {
      toast.error(err.message || t('photo_delete_error', 'Error al eliminar la foto.'));
    },
  });

  const handleFileUploadChange = useCallback((files) => {
    if (files.length > 0) {
      setFileToUpload(files[0]);
    } else {
      setFileToUpload(null);
    }
  }, []);

  const handleUploadButtonClick = () => {
    if (!fileToUpload) {
      toast.error(t('no_file_selected', 'Por favor, selecciona una imagen para subir.'));
      return;
    }
    if (userPhotos && userPhotos.length >= 5) {
      toast.error(t('max_photos_reached', 'Solo puedes subir hasta 5 fotos.'));
      return;
    }
    uploadPhotoMutation.mutate({ userId, file: fileToUpload, title: photoTitle });
  };


  const handleDeletePhoto = (photoId) => {
    if (window.confirm(t('confirm_delete_photo', '¿Estás seguro de que quieres eliminar esta foto?'))) {
      deletePhotoMutation.mutate({ userId, photoId });
    }
  };

  const handleOpenPhotoView = (photo) => {
    setSelectedPhotoToView(photo);
  };

  const handleClosePhotoView = () => {
    setSelectedPhotoToView(null);
  };

  const lang = i18n.language;

  return (
    <Stack sx={{ mt: 4, mb: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t('profile_photos_title', 'Fotos del Perfil')}
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : isError ? (
        <Alert severity="error">{error.message || t('error_loading_photos', 'Error al cargar fotos.')}</Alert>
      ) : (
        <Grid container spacing={2}>
          {userPhotos.map((photo) => {
            const title = photo[`title_${lang}`] || photo.title;
            return (
              <Grid item key={photo.id} xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 150,
                    overflow: 'hidden',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover .delete-button': {
                      opacity: 1,
                    },
                  }}
                  onClick={() => handleOpenPhotoView(photo)}
                >
                  <Image
                    src={photo.url} // Use the full URL from the backend
                    alt={title}
                    width={200} // Specify width
                    height={150} // Specify height
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {isMyProfile && (
                    <IconButton
                      color="error"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
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
                <Typography variant="caption" display="block" gutterBottom>
                  {title}
                </Typography>
              </Grid>
            );
          })}
          {isMyProfile && userPhotos.length < 5 && !showPhotoUpload && (
            <Grid item xs={12}>
                <Button
                    variant="contained"
                    startIcon={<AddPhotoAlternateIcon />}
                    onClick={() => setShowPhotoUpload(true)}
                    sx={{ mt: 1 }}
                >
                    {t('add_photo', 'Añadir Foto')}
                </Button>
            </Grid>
          )}
        </Grid>
      )}

      {isMyProfile && showPhotoUpload && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('upload_new_photo', 'Subir nueva foto')}</Typography>
          <TextField
            label={t("photo_title", "Título de la Foto")}
            value={photoTitle}
            onChange={(e) => setPhotoTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FileUpload
            onFilesChange={handleFileUploadChange}
            multiple={false}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button onClick={() => setShowPhotoUpload(false)} variant="outlined">{t('cancel', 'Cancelar')}</Button>
            <Button onClick={handleUploadButtonClick} variant="contained" disabled={uploadPhotoMutation.isLoading || !fileToUpload}>
              {uploadPhotoMutation.isLoading ? t('uploading', 'Subiendo...') : t('upload', 'Subir')}
            </Button>
          </Stack>
        </Box>
      )}

      {/* Photo View Modal */}
      <Dialog open={!!selectedPhotoToView} onClose={handleClosePhotoView} maxWidth="lg" fullWidth>
        <DialogContent>
          {selectedPhotoToView && (
            <Image
              src={selectedPhotoToView.url} // Use the full URL from the backend
              alt={selectedPhotoToView[`title_${lang}`] || selectedPhotoToView.title}
              width={800} // Specify a reasonable max width
              height={600} // Specify a reasonable max height
              style={{
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhotoView}>{t('close', 'Cerrar')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default UserPhotosSection;
