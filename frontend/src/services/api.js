import axios from "axios";

// Determine the base URL from environment variables or use a default for local development.
const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Ensure the base URL ends with '/api' to prevent routing errors in production.
// This removes a trailing '/api' if it exists and then adds it, ensuring it's present exactly once.
const normalizedApiUrl = `${apiBaseUrl.replace(/\/api\/?$/, "")}/api`;

const apiClient = axios.create({
  baseURL: normalizedApiUrl,
  withCredentials: true, // Allows axios to send cookies for session management.
});

// An interceptor is not needed here as the browser handles cookies automatically with `withCredentials: true`.

export default apiClient;