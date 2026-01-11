'use client';

import React from 'react';
import Link from 'next/link'; // Import next/link
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Stack } from '@mui/material'; // Import Material UI components

export default function PagoPendienteMP() {
  const { t } = useTranslation('common');

  return (
    <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'white' }}>
        {t('payment_pending_title', 'Pago Pendiente')}
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: 'white' }}>
        {t('mp_payment_pending_message', 'Tu pago está pendiente de aprobación.')}
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: 'white' }}>
        {t('mp_payment_pending_notification', 'Te notificaremos cuando se complete.')}
      </Typography>
      <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
        <Button
          component={Link}
          href="/"
          variant="contained"
          color="primary"
        >
          {t('back_to_home', 'Volver al inicio')}
        </Button>
      </Stack>
    </Box>
  );
}
