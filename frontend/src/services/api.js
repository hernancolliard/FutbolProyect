import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  withCredentials: true, // Allows axios to send cookies for session management.
});

// Interceptor to prepend /api to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Ensure the URL starts with /api, but don't add it if it's already there.
    if (config.url && !config.url.startsWith("/api")) {
      // Ensure there's a leading slash if the original URL was relative, then add /api.
      const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
      config.url = `/api${path}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
