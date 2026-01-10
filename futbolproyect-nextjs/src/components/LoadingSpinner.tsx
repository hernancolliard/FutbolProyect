'use client';

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next'; // Import useTranslation

function LoadingSpinner({ text }) {
  const { t } = useTranslation('common'); // Initialize useTranslation

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <CircularProgress />
      {text && <Typography sx={{ mt: 2 }}>{t(text)}</Typography>} {/* Translate the text prop */}
    </Box>
  );
}

export default LoadingSpinner;