import axios from "axios";

const publicApi = axios.create({
  // el backend base URL puede venir de la variable de entorno; si no está definida,
  // usamos `/api` para que las peticiones se dirijan al servidor proxy
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
});

export default publicApi;
