import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Alert, MenuItem, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '../services/api';
import FileUpload from './FileUpload'; // Reutilizamos el componente de subida de archivos

const saveVideo = async ({ videoData, isEdit, videoId }) => {
  const formData = new FormData();
  for (const key in videoData) {
    if (key === 'coverImageFile' && videoData[key]) {
      formData.append('cover_image', videoData[key]);
    } else if (videoData[key] !== null && videoData[key] !== undefined && key !== 'id') {
      formData.append(key, videoData[key]);
    }
  }

  if (isEdit) {
    const { data } = await apiClient.put(`/profiles/videos/${videoId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } else {
    const { data } = await apiClient.post('/profiles/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
};

const VideoFormModal = ({ open, onClose, video, onSave }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    id: video?.id || null,
    title: video?.title || '',
    youtube_url: video?.youtube_url || '',
    position: video?.position || '',
    coverImageFile: null, // Para el nuevo archivo de imagen
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (video) {
      setFormData({
        id: video.id,
        title: video.title,
        youtube_url: video.youtube_url,
        position: video.position === null || video.position === undefined ? '' : video.position,
        coverImageFile: null,
      });
    } else {
      setFormData({
        id: null,
        title: '',
        youtube_url: '',
        position: '',
        coverImageFile: null,
      });
    }
    setError('');
    setUploadProgress(0);
  }, [open, video]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files) => {
    setFormData((prev) => ({ ...prev, coverImageFile: files[0] || null }));
  };

  const { mutate, isLoading: isSaving } = useMutation({
    mutationFn: (data) => saveVideo(data),
    onSuccess: (data) => {
      toast.success(data.message || t('video_saved_success'));
      queryClient.invalidateQueries(['userVideos', video?.user_id]); // Invalida la caché de videos del usuario
      onSave(); // Llama a la función onSave del padre
      onClose();
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t('video_save_error');
      setError(errorMessage);
      toast.error(errorMessage);
    },
    onSettled: () => {
      setUploadProgress(0);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    mutate({ videoData: formData, isEdit: !!video, videoId: video?.id });
  };

  const positions = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{video ? t('edit_video') : t('add_video')}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              name="title"
              label={t('video_title')}
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="youtube_url"
              label={t('youtube_link')}
              value={formData.youtube_url}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              name="position"
              label={t('video_position')}
              value={formData.position}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="">{t('select_position_placeholder', 'Selecciona una posición')}</MenuItem>
              {positions.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </TextField>
            
            <FileUpload 
              onFilesChange={handleFileChange} 
              uploadProgress={uploadProgress} 
              initialFiles={video?.cover_image_url ? [{ preview: video.cover_image_url }] : []}
            />

            {isSaving && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={20} />
                <Typography>{t('saving_video')}</Typography>
              </Stack>
            )}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>{t('cancel')}</Button>
        <Button onClick={handleSubmit} disabled={isSaving} variant="contained">{t('save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoFormModal;
