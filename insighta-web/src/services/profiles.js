import api from './api';

// Get all profiles with filters and pagination
export const getProfiles = async (params) => {
  try {
    const response = await api.get('/api/v1/profiles', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single profile by ID
export const getProfile = async (id) => {
  try {
    const response = await api.get(`/api/v1/profiles/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Search profiles
export const searchProfiles = async (query, page = 1, limit = 10) => {
  try {
    const response = await api.get('/api/v1/profiles/search', {
      params: { q: query, page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export profiles (admin only)
export const exportProfiles = async (filters = {}) => {
  try {
    const response = await api.get('/api/v1/profiles/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create profile (admin only)
export const createProfile = async (profileData) => {
  try {
    const response = await api.post('/api/v1/profiles', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete profile (admin only)
export const deleteProfile = async (id) => {
  try {
    const response = await api.delete(`/api/v1/profiles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
