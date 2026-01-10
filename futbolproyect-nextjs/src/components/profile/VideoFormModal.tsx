'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Alert, MenuItem, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Video } from '@/lib/types';
import FileUpload from '@/components/ui/FileUpload';
import { useRouter } from 'next/navigation';

interface VideoFormModalProps {
    open: boolean;
    onClose: () => void;
    video: Video | null;
    onSave: () => void; // Callback to refresh data on parent
}

const saveVideo = async ({ videoData, isEdit, videoId }: { videoData: any, isEdit: boolean, videoId: number | null }): Promise<any> => {
    const formData = new FormData();
    // Append all form data
    Object.keys(videoData).forEach(key => {
        if (videoData[key] !== null && videoData[key] !== undefined) {
            formData.append(key, videoData[key]);
        }
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const endpoint = isEdit ? `/api/profiles/videos/${videoId}` : '/api/profiles/videos';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(apiUrl + endpoint, {
        method: method,
        body: formData,
        // Don't set Content-Type, browser will set it with boundary
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'Failed to save video');
    }

    return res.json();
};

const VideoFormModal = ({ open, onClose, video, onSave }: VideoFormModalProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [formData, setFormData] = useState<{
        title: string;
        youtube_url: string;
        position: number | string;
        cover_image: File | null;
    }>({
        title: '',
        youtube_url: '',
        position: '',
        cover_image: null,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setFormData({
                title: video?.title || '',
                youtube_url: video?.youtube_url || '',
                position: video?.position || '',
                cover_image: null,
            });
            setError(null);
        }
    }, [open, video]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (files: File[]) => {
        setFormData((prev) => ({ ...prev, cover_image: files[0] || null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            await saveVideo({
                videoData: formData,
                isEdit: !!video?.id,
                videoId: video?.id || null,
            });
            // alert(t('video_saved_success'));
            onSave(); // This will trigger a data refresh in the parent
            onClose();
        } catch (err: any) {
            setError(err.message);
            // alert(err.message);
        } finally {
            setIsSaving(false);
        }
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
                            SelectProps={{
                                displayEmpty: true
                            }}
                        >
                            <MenuItem value="" disabled>{t('select_position_placeholder', 'Selecciona una posición')}</MenuItem>
                            {positions.map((pos) => (
                                <MenuItem key={pos} value={pos}>
                                    {pos}
                                </MenuItem>
                            ))}
                        </TextField>
                        
                        <Typography variant="subtitle2" sx={{color: 'text.secondary', pt: 1}}>{t('cover_image', 'Imagen de Portada')}</Typography>
                        <FileUpload 
                            onFilesChange={handleFileChange}
                            multiple={false}
                            initialFiles={video?.cover_image_url ? [{ preview: video.cover_image_url }] : []}
                        />

                        {isSaving && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <CircularProgress size={20} />
                            <Typography>{t('saving_video', 'Guardando video...')}</Typography>
                        </Stack>
                        )}
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSaving}>{t('cancel', 'Cancelar')}</Button>
                <Button onClick={handleSubmit} disabled={isSaving} variant="contained">{t('save', 'Guardar')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default VideoFormModal;
