import api from './api';

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    throw error;
  }
};

const getApiHost = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
};

// Get GitHub OAuth redirect URL
export const getGithubAuthUrl = (state, codeChallenge, codeVerifier) => {
  const params = new URLSearchParams({
    state,
    code_challenge: codeChallenge
  });

  if (codeVerifier) {
    params.set('code_verifier', codeVerifier);
  }

  return `${getApiHost()}/auth/github?${params.toString()}`;
};

// Exchange code for token
export const exchangeCode = async (code, codeVerifier) => {
  try {
    const response = await api.post('/auth/exchange', {
      code,
      code_verifier: codeVerifier
    });
    // Response includes both user object and tokens (tokens also set in cookies automatically)
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

// Refresh token
export const refreshAccessToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    return response.data.user;
  } catch (error) {
    throw error;
  }
};
