import axios from 'axios';

const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const apiBaseUrl = apiHost.endsWith('/api') ? apiHost : `${apiHost}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

// Request interceptor to add X-API-Version header
api.interceptors.request.use((config) => {
  config.headers['X-API-Version'] = '1';
  return config;
});

// Global refresh promise to prevent concurrent refresh attempts
let refreshPromise = null;
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const now = Date.now();
      
      // Prevent refresh attempts too close together
      if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      lastRefreshAttempt = now;

      // If refresh is already in progress, wait for it
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh')
          .catch(err => {
            console.log('Refresh failed:', err.response?.data || err.message);
            throw err;
          })
          .finally(() => {
            refreshPromise = null; // Reset after completion
          });
      }

      try {
        await refreshPromise;
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, need to login again
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
