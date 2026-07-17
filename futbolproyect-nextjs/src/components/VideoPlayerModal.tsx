'use client';

import React from 'react';
import { Dialog, DialogContent, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Función para extraer el ID del video de una URL de YouTube
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const VideoPlayerModal = ({ open, onClose, youtubeUrl }) => {
  const { t } = useTranslation('common');
  const videoId = getYouTubeId(youtubeUrl);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { bgcolor: 'black' } }} // Pone el fondo del Dialog en negro
    >
      <DialogContent sx={{ p: 0 }}>
        {videoId ? (
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%', // 16:9 Aspect Ratio
              height: 0,
              overflow: 'hidden',
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={t('embedded_youtube_video')}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </Box>
        ) : (
          <Box sx={{ p: 4, color: 'white', textAlign: 'center' }}>
            {t('invalid_video_url')}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;
