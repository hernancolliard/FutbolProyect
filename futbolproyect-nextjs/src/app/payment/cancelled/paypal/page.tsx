'use client';

import React from 'react';
import Link from 'next/link'; // Import next/link
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Stack } from '@mui/material'; // Import Material UI components

export default function PagoCanceladoPayPal() {
  const { t } = useTranslation('common');

  return (
    <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'white' }}>
        {t('paypal_payment_cancelled_title', 'Pago Cancelado con PayPal')}
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: 'white' }}>
        {t('payment_cancelled_message', 'Tu pago ha sido cancelado o no se pudo procesar.')}
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: 'white' }}>
        {t('payment_try_again_message', 'Por favor, inténtalo de nuevo.')}
      </Typography>
      <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
        <Button
          component={Link}
          href="/suscripcion"
          variant="contained"
          color="primary"
        >
          {t('back_to_subscriptions', 'Volver a Suscripciones')}
        </Button>
      </Stack>
    </Box>
  );
}
