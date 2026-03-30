import axios from "axios";

// Normalize API base URL: remove /api suffix and trailing slashes, then add /api
const getApiBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (raw) {
    // quitar barra final
    let url = raw.replace(/\/+$/, '');
    // si alguien puso /api al final, quitarlo para evitar duplicados
    url = url.replace(/\/api$/, '');
    return `${url}/api`;
  }
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/api`;
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  // Check if running on the client side before accessing localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("token");
    console.log("API Interceptor: Token from localStorage:", token); // DEBUG LOG

    if (token && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("API Interceptor: Authorization header set."); // DEBUG LOG
    }
  }
  return config;
});

export default apiClient;
