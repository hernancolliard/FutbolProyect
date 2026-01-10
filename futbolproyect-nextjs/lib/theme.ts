'use client';

import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: Palette['primary'];
  }
  interface PaletteOptions {
    custom?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    custom: true;
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2', // Un azul que combina con colores tierra
    },
    secondary: {
      main: '#F5A623', // Un naranja terroso
    },
    custom: { // Ejemplo de color adicional para la nueva paleta de colores tierra y azules
      main: '#8B572A', // Marrón tierra
    },
    background: {
      default: '#F5F5F5', // Fondo claro
      paper: '#FFFFFF',   // Fondo de elementos como tarjetas
    },
    text: {
      primary: '#333333', // Texto oscuro
      secondary: '#666666', // Texto secundario
    },
    // Puedes añadir más colores según la paleta definida por el usuario
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#333333',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#333333',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#333333',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#333333',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
      color: '#666666',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#2C3E50', // Azul oscuro para el AppBar
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    // Añadir más personalizaciones si es necesario
  },
});

export default theme;
