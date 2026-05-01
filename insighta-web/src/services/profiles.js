import api from './api';

// Get all profiles. params can include gender, country, age_group, page, limit, etc.
export const getProfiles = async (params) => {
  try {
    const response = await api.get('/profiles', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get one profile by its custom UUID/Mongo id.
export const getProfile = async (id) => {
  try {
    const response = await api.get(`/profiles/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Search profiles using natural language text, plus pagination.
export const searchProfiles = async (query, page = 1, limit = 10) => {
  try {
    const response = await api.get('/profiles/search', {
      params: { q: query, page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export profiles as a CSV blob. Backend enforces admin access where required.
export const exportProfiles = async (filters = {}) => {
  try {
    const response = await api.get('/profiles/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a profile. Backend checks that the user is an admin.
export const createProfile = async (profileData) => {
  try {
    const response = await api.post('/profiles', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a profile. Backend checks that the user is an admin.
export const deleteProfile = async (id) => {
  try {
    const response = await api.delete(`/profiles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
