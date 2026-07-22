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
    saveEndpoint?: string;
    saveMethod?: "post" | "put";
    title?: string;
    submitLabel?: string;
    showEmailField?: boolean;
}

const style = {
    position: 'absolute' as 'absolute',
    top: { xs: 12, sm: '50%' },
    left: '50%',
    transform: { xs: 'translateX(-50%)', sm: 'translate(-50%, -50%)' },
    width: { xs: 'calc(100vw - 24px)', sm: 'min(92vw, 820px)', md: 'min(88vw, 960px)' },
    maxWidth: '960px',
    boxSizing: 'border-box',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: { xs: 1, sm: 2 },
    maxHeight: { xs: 'calc(100dvh - 24px)', sm: '90vh' },
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
    borderRadius: { xs: 2, sm: 3 },
    outline: 'none',
};

const EditProfileModal = ({
  open,
  onClose,
  profileData,
  onSave,
  saveEndpoint,
  saveMethod,
  title,
  submitLabel,
  showEmailField,
}: EditProfileModalProps) => {
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
                    saveEndpoint={saveEndpoint}
                    saveMethod={saveMethod}
                    title={title}
                    submitLabel={submitLabel}
                    showEmailField={showEmailField}
                />
            </Box>
        </Modal>
    );
};

export default EditProfileModal;
