// lib/publicApi.ts
import axios from "axios";

const publicApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // 🔑 SIN cookies, SIN sesión
});

export default publicApi;
