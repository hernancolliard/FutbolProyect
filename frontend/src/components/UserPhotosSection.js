import React, { useState, useCallback } from 'react';
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
import apiClient from '../services/api';
import FileUpload from './FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

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
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedPhotoToView, setSelectedPhotoToView] = useState(null);
  const [photoTitle, setPhotoTitle] = useState("");

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
      toast.success(t('photo_upload_success'));
      // Manually update the cache to avoid race conditions and ensure it's an array
      queryClient.setQueryData(['userPhotos', userId], (oldData) => {
        return oldData ? [...oldData, newPhoto] : [newPhoto];
      });
      setShowPhotoUpload(false);
      setPhotoTitle("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('photo_upload_error'));
    },
  });

  // Mutation for deleting photo
  const deletePhotoMutation = useMutation({
    mutationFn: deletePhoto,
    onSuccess: (data, variables) => {
      toast.success(data.message || t('photo_delete_success'));
      // Manually remove the photo from the cache
      queryClient.setQueryData(['userPhotos', userId], (oldData) => {
        return oldData ? oldData.filter(photo => photo.id !== variables.photoId) : [];
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('photo_delete_error'));
    },
  });

  const handleFileUpload = useCallback((files) => {
    if (files.length > 0) {
      if (userPhotos && userPhotos.length >= 5) {
        toast.error(t('max_photos_reached', 'You can only upload up to 5 photos.'));
        return;
      }
      uploadPhotoMutation.mutate({ userId, file: files[0], title: photoTitle });
    }
  }, [userId, userPhotos, uploadPhotoMutation, t, photoTitle]);

  const handleDeletePhoto = (photoId) => {
    if (window.confirm(t('confirm_delete_photo', 'Are you sure you want to delete this photo?'))) {
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
                  <img
                    src={photo.url} // Use the full URL from the backend
                    alt={title}
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
                    {t('add_photo')}
                </Button>
            </Grid>
          )}
        </Grid>
      )}

      {isMyProfile && showPhotoUpload && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('upload_new_photo')}</Typography>
          <TextField
            label={t("photo_title")}
            value={photoTitle}
            onChange={(e) => setPhotoTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FileUpload
            onFilesChange={handleFileUpload}
            multiple={false}
          />
          <Button onClick={() => setShowPhotoUpload(false)} sx={{ mt: 1 }}>{t('cancel')}</Button>
        </Box>
      )}

      {/* Photo View Modal */}
      <Dialog open={!!selectedPhotoToView} onClose={handleClosePhotoView} maxWidth="md">
        <DialogContent>
          {selectedPhotoToView && (
            <img
              src={selectedPhotoToView.url} // Use the full URL from the backend
              alt={selectedPhotoToView[`title_${lang}`] || selectedPhotoToView.title}
              style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhotoView}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default UserPhotosSection;
