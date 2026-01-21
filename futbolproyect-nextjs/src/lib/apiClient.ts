// lib/apiClient.ts
import axios from "axios";

// Base URL
let apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (apiBaseUrl) {
  if (!apiBaseUrl.endsWith("/api")) {
    apiBaseUrl = `${apiBaseUrl}/api`;
  }
} else {
  apiBaseUrl = "/api";
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔐 SOLO sesiones privadas
});

export default apiClient;
