import api from './api';

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/v1/auth/me');
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await api.post('/api/v1/auth/logout');
  } catch (error) {
    throw error;
  }
};

// Get GitHub OAuth redirect URL
export const getGithubAuthUrl = (state, codeChallenge) => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/auth/github?state=${state}&code_challenge=${codeChallenge}`;
};

// Exchange code for token
export const exchangeCode = async (code, codeVerifier) => {
  try {
    const response = await api.post('/api/v1/auth/exchange', {
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
    const response = await api.post('/api/v1/auth/refresh');
    return response.data.user;
  } catch (error) {
    throw error;
  }
};
