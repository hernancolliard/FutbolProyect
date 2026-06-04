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
