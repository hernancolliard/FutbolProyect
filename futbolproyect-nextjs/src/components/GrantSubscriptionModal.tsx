'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Box, Typography, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function GrantSubscriptionModal({ open, onClose, onGrant, user }) {
  const { t } = useTranslation('common');
  const [planType, setPlanType] = useState('postulante');
  const [duration, setDuration] = useState('1-month');

  const handleGrant = () => {
    onGrant(user.id, { planType, duration });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="grant-subscription-modal-title"
    >
      <Box sx={style}>
        <Typography id="grant-subscription-modal-title" variant="h6" component="h2">
          {t('grant_subscription_to_user', { email: user?.email, defaultValue: `Otorgar suscripción a ${user?.email || 'usuario'}` })}
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="plan-type-label">{t('plan_type_label', 'Tipo de Plan')}</InputLabel>
          <Select
            labelId="plan-type-label"
            value={planType}
            label={t('plan_type_label', 'Tipo de Plan')}
            onChange={(e) => setPlanType(e.target.value)}
          >
            <MenuItem value="postulante">{t('postulante_plan', 'Postulante')}</MenuItem>
            <MenuItem value="ofertante">{t('ofertante_plan', 'Ofertante')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="duration-label">{t('duration_label', 'Duración')}</InputLabel>
          <Select
            labelId="duration-label"
            value={duration}
            label={t('duration_label', 'Duración')}
            onChange={(e) => setDuration(e.target.value)}
          >
            <MenuItem value="1-month">{t('duration_1_month', '1 Mes')}</MenuItem>
            <MenuItem value="1-year">{t('duration_1_year', '1 Año')}</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>{t('cancel_button', 'Cancelar')}</Button>
          <Button onClick={handleGrant} variant="contained" sx={{ ml: 1 }}>{t('grant_button', 'Otorgar')}</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default GrantSubscriptionModal;
