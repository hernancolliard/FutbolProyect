import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Estilos globales
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import "./i18n"; // Import i18n configuration

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
