import axios from "axios";
import { clearCredentials, loadCredentials } from "./storage.js";
import { refreshAccessToken } from "./auth.js";
import { BASE_URL } from "../config/index.js";

const api = axios.create({
  baseURL: BASE_URL
});

api.interceptors.request.use(async (config) => {
  // Load saved CLI credentials before every request.
  const creds = await loadCredentials();

  // Attach the access token so protected backend routes can authorize the request.
  if (creds?.access_token) {
    config.headers.Authorization = `Bearer ${creds.access_token}`;
  }

  // Backend profile routes require the API version header.
  config.headers["X-API-Version"] = "1";

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If the access token expired, try refreshing once and then retry the request.
    if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Refreshing session...");
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // If refresh fails, clear bad credentials and ask the user to login again.
        await clearCredentials();
        throw new Error("Session expired. Run: insighta login");
      }
    }

    return Promise.reject(err);
  }
);

export default api;
