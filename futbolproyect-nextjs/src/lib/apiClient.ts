import axios from "axios";

// En producción (Render), al estar en el mismo dominio, la URL base puede ser relativa o la de entorno.
// Usar una ruta relativa "/api" es lo más seguro en tu arquitectura de servidor único.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ¡CRÍTICO! Esto permite enviar/recibir cookies de sesión
});

export default apiClient;
