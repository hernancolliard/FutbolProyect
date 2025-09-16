import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function LoadingSpinner({ text }) {
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
      {text && <Typography sx={{ mt: 2 }}>{text}</Typography>}
    </Box>
  );
}

export default LoadingSpinner;
