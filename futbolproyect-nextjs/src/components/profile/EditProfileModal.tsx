'use client';

import React from 'react';
import { Modal, Box } from '@mui/material';
import { Profile } from '@/lib/types';
import EditProfileForm from './EditProfileForm';

interface EditProfileModalProps {
    open: boolean;
    onClose: () => void;
    profileData: Profile;
    onSave: () => void;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: '80%', md: '700px' },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 2,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 2,
};

const EditProfileModal = ({ open, onClose, profileData, onSave }: EditProfileModalProps) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="edit-profile-modal-title"
        >
            <Box sx={style}>
                <EditProfileForm
                    profileData={profileData}
                    onSave={onSave}
                    onCancel={onClose}
                />
            </Box>
        </Modal>
    );
};

export default EditProfileModal;
