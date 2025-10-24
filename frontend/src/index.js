import React from "react";
import ReactDOM from "react-dom/client";

// --- Imports del carrusel (Esto soluciona el carrusel) ---
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import "./index.css"; // Estilos globales

// --- Tus nuevas importaciones (QueryClient, Google, etc.) ---
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App"; //
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; //

// --- ¡¡ESTAS SON LAS LÍNEAS QUE HABÍAS BORRADO!! ---
// --- (Necesarias para Login y Traducciones) ---
import { AuthProvider } from "./context/AuthContext"; //
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n"; //

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Debes volver a agregar I18nextProvider */}
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* Debes volver a agregar AuthProvider */}
          <AuthProvider>
            <GoogleOAuthProvider
              clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            >
              <App />
            </GoogleOAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
