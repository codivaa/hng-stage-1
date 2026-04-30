import axios from "axios";
import { clearCredentials, loadCredentials } from "./storage.js";
import { refreshAccessToken } from "./auth.js";
import { BASE_URL } from "../config/index.js";

const api = axios.create({
  baseURL: BASE_URL
});

api.interceptors.request.use(async (config) => {
  const creds = await loadCredentials();

  if (creds?.access_token) {
    config.headers.Authorization = `Bearer ${creds.access_token}`;
  }

  config.headers["X-API-Version"] = "1";

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Refreshing session...");
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        await clearCredentials();
        throw new Error("Session expired. Run: insighta login");
      }
    }

    return Promise.reject(err);
  }
);

export default api;
