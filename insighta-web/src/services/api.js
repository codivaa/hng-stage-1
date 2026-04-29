import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true
});

// Request interceptor to add X-API-Version header
api.interceptors.request.use((config) => {
  config.headers['X-API-Version'] = '1';
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post('/auth/refresh');
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
