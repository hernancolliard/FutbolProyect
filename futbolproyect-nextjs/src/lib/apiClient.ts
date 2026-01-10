import axios from "axios";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // Allows axios to send cookies for session management.
});

// Interceptor to prepend /api to all request URLs
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    // Only prepend /api if it's not already part of the URL path.
    if (!url.startsWith("/api")) {
      // Ensure there's a leading slash
      const path = url.startsWith('/') ? url : `/${url}`;
      config.url = `/api${path}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;