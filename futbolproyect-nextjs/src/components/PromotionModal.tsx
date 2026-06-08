'use client';

import React from 'react';
import Modal from './ui/Modal'; // Migrated Modal
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Stack, IconButton } from '@mui/material'; // Material UI components
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon

const PromotionModal = ({ isOpen, onClose, onShowRegisterModal }) => {
    const { t } = useTranslation('common');

    const handleRegisterClick = (role) => {
        onShowRegisterModal(role);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Box sx={{
                position: 'relative',
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 2,
                textAlign: 'center',
                maxWidth: 400,
                mx: 'auto',
                mt: '10vh', // Adjust as needed
            }}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('promotionModal.title', '¡Únete a FutbolProyect!')}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t('promotionModal.description', 'Regístrate hoy y conecta con la comunidad del fútbol.')}
                </Typography>
                <Stack direction="column" spacing={2} sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRegisterClick('postulante')}
                    >
                        {t('promotionModal.registerPlayer')}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleRegisterClick('ofertante')}
                    >
                        {t('promotionModal.registerClub')}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default PromotionModal;
