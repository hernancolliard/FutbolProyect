"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";

// Definimos un tema básico (puedes personalizar los colores aquí luego)
const theme = createTheme({
  palette: {
    primary: {
      main: "#192634", // Color solicitado por el usuario
    },
    secondary: {
      main: "#dc004e", // Rosa/Rojo estándar
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline resetea los estilos del navegador para que MUI funcione bien */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
