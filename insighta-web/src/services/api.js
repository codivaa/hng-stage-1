import axios from 'axios';

// VITE_API_URL points to the backend host; /api is added if it is not already there.
const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const apiBaseUrl = apiHost.endsWith('/api') ? apiHost : `${apiHost}/api`;

// Shared Axios client for all protected backend requests.
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

// Add API version header required by protected profile routes.
api.interceptors.request.use((config) => {
  config.headers['X-API-Version'] = '1';
  return config;
});

// Global refresh promise prevents multiple refresh calls from firing at once.
let refreshPromise = null;
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds

// If a request gets 401, try refreshing the cookie session and retry once.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const now = Date.now();
      
      // Prevent refresh attempts too close together.
      if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      lastRefreshAttempt = now;

      // If refresh is already in progress, wait for it instead of starting another.
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh')
          .catch(err => {
            console.log('Refresh failed:', err.response?.data || err.message);
            throw err;
          })
          .finally(() => {
            refreshPromise = null; // Reset after completion.
          });
      }

      try {
        await refreshPromise;
        // Retry the original request after refresh succeeds.
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, so the page should send the user back to login.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
