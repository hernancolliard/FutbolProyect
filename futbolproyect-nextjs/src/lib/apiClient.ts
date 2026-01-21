import axios from "axios";

// En producción (Render), al estar en el mismo dominio, la URL base puede ser relativa o la de entorno.
// Usar una ruta relativa "/api" es lo más seguro en tu arquitectura de servidor único.
// Determinar la base URL de la API
let apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Asegurarse de que apiBaseUrl termina con /api, o es solo /api
if (apiBaseUrl) {
  // Si apiBaseUrl es un URL completo como "https://futbolproyect.com", añadir /api
  if (!apiBaseUrl.endsWith('/api')) {
    apiBaseUrl = `${apiBaseUrl}/api`;
  }
} else {
  // Si no está definida, usar la ruta relativa /api (útil en desarrollo o si el frontend/backend están en el mismo origen)
  apiBaseUrl = "/api";
}


const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ¡CRÍTICO! Esto permite enviar/recibir cookies de sesión
});

export default apiClient;
