'use client';

import React, { useState } from 'react';
import apiClient from '../../../lib/apiClient'; // Centralized apiClient
import { useTranslation } from 'react-i18next';
import { TextField, Button, Stack, Typography, Alert, CircularProgress, Box, Card, CardContent } from '@mui/material'; // Import Material UI components

export default function ForgotPasswordPage() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await apiClient.post('/users/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.message || t('error_generic', 'Ocurrió un error. Por favor, inténtalo de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card sx={{ maxWidth: 400, width: '100%', p: 2 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {t('forgot_password_title', '¿Olvidaste tu contraseña?')}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                type="email"
                id="email"
                label={t('email_label', 'Correo Electrónico')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              {message && <Alert severity="success">{message}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : t('send_reset_link', 'Enviar Enlace de Restablecimiento')}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
