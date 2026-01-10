'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Grid, Button, CircularProgress, Alert, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Video } from '@/lib/types';
import VideoCard from './VideoCard';
import VideoPlayerModal from './VideoPlayerModal';
import VideoFormModal from './VideoFormModal';

interface VideosSectionProps {
    userId: number;
    isMyProfile: boolean;
}

const fetchUserVideos = async (userId: number): Promise<Video[]> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    try {
        const res = await fetch(`${apiUrl}/api/profiles/${userId}/videos`);
        if (!res.ok) {
            console.error(`Failed to fetch videos for user ${userId}: ${res.statusText}`);
            return [];
        }
        return res.json();
    } catch (error) {
        console.error(`Network error fetching videos for user ${userId}:`, error);
        return [];
    }
};


export default function VideosSection({ userId, isMyProfile }: VideosSectionProps) {
    const { t } = useTranslation();
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for modals
    const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
    const [selectedVideoToPlay, setSelectedVideoToPlay] = useState<Video | null>(null);
    const [showVideoFormModal, setShowVideoFormModal] = useState(false);
    const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);

    const loadVideos = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const userVideos = await fetchUserVideos(userId);
            setVideos(userVideos);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);
    
    // --- Modal Handlers ---
    const handleOpenVideoPlayer = (video: Video) => {
        setSelectedVideoToPlay(video);
        setShowVideoPlayerModal(true);
    };

    const handleCloseVideoPlayer = () => {
        setSelectedVideoToPlay(null);
        setShowVideoPlayerModal(false);
    };

    const handleOpenVideoForm = (video: Video | null = null) => {
        setVideoToEdit(video);
        setShowVideoFormModal(true);
    };

    const handleCloseVideoForm = () => {
        setVideoToEdit(null);
        setShowVideoFormModal(false);
    };

    const handleVideoSaved = () => {
        handleCloseVideoForm();
        loadVideos(); // Refresh videos after saving
    };
    
    const handleDeleteVideo = async (videoId: number) => {
        if (window.confirm(t('are_you_sure_delete_video', '¿Estás seguro de que quieres eliminar este video?'))) {
             const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
             try {
                const res = await fetch(`${apiUrl}/api/profiles/videos/${videoId}`, { method: 'DELETE' });
                if(!res.ok) {
                    throw new Error('Failed to delete video');
                }
                loadVideos();
             } catch (error) {
                console.error('Error deleting video', error);
             }
        }
    };


    const videosToDisplay = Array(5).fill(null);
    videos.forEach((video) => {
        if (video.position >= 1 && video.position <= 5) {
            videosToDisplay[video.position - 1] = video;
        }
    });

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t("profile_videos_title", "Videos del Perfil")}
            </Typography>
            {isLoading ? (
              <CircularProgress />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Grid container spacing={2}>
                {videosToDisplay.map((video, index) => (
                  <Grid item xs={12} sm={6} md={4} key={video?.id || index}>
                    <VideoCard
                      video={video}
                      isMyProfile={isMyProfile}
                      onAdd={() => isMyProfile && handleOpenVideoForm()}
                      onEdit={(v) => handleOpenVideoForm(v)}
                      onPlay={handleOpenVideoPlayer}
                      onDelete={handleDeleteVideo}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {isMyProfile && (
              <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={() => handleOpenVideoForm()}
              >
                {t("add_new_video", "Añadir nuevo video")}
              </Button>
            )}
            
            {/* Player Modal */}
            {selectedVideoToPlay && (
                <VideoPlayerModal open={showVideoPlayerModal} onClose={handleCloseVideoPlayer} youtubeUrl={selectedVideoToPlay.youtube_url} />
            )}

            {/* Form Modal */}
            {showVideoFormModal && (
                <VideoFormModal open={showVideoFormModal} onClose={handleCloseVideoForm} video={videoToEdit} onSave={handleVideoSaved} />
            )}
        </Box>
    );
}
