import axios from "axios";

const getPublicApiBaseUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

  if (raw) {
    const url = raw.replace(/\/+$/, "").replace(/\/api$/, "");
    return `${url}/api`;
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/api`;
};

const publicApi = axios.create({
  baseURL: getPublicApiBaseUrl(),
  withCredentials: true,
});

export default publicApi;
