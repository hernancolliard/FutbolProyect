import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Permite que axios envíe cookies
});

// El interceptor ya no es necesario, el navegador manejará la cookie de forma automática.

export default apiClient;
