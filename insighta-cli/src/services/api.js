import axios from "axios";
import { loadCredentials } from "./storage.js";
import { refreshAccessToken } from "./auth.js";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1"
});

// 🔐 Request interceptor
api.interceptors.request.use(async (config) => {
  const creds = await loadCredentials();

  if (creds?.access_token) {
    config.headers.Authorization = `Bearer ${creds.access_token}`;
  }

  // ✅ ADD THIS (VERY IMPORTANT)
  config.headers["X-API-Version"] = "1";

  return config;
});


// 🔄 Response interceptor (you already have similar logic probably)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("🔄 Refreshing session...");

      const newAccessToken = await refreshAccessToken();

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    }

    return Promise.reject(err);
  }
);

export default api;