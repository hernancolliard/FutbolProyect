'use client';

import React from 'react';
import { Dialog, DialogContent, Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';

// Function to extract YouTube video ID from a URL
const getYouTubeId = (url: string | null): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface VideoPlayerModalProps {
    open: boolean;
    onClose: () => void;
    youtubeUrl: string | null;
    title?: string;
}

const VideoPlayerModal = ({ open, onClose, youtubeUrl, title }: VideoPlayerModalProps) => {
    const { t } = useTranslation();
    const videoId = getYouTubeId(youtubeUrl);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { bgcolor: 'black', overflow: 'hidden' } }}
        >
            <DialogContent sx={{ p: 0, position: 'relative' }}>
                <IconButton
                    aria-label={t('close', 'Cerrar')}
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        color: '#fff',
                        bgcolor: 'rgba(0, 0, 0, .58)',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, .78)' },
                    }}
                >
                    <CloseRoundedIcon />
                </IconButton>
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
                            title={title || t('embedded_youtube_video', 'Video de YouTube insertado')}
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
                        <Typography>{t('invalid_video_url', 'URL de video no válida.')}</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default VideoPlayerModal;
