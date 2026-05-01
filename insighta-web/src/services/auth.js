import api from './api';

// Ask the backend who is logged in using the HTTP-only cookie session.
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

// Tell the backend to invalidate the refresh token and clear auth cookies.
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    throw error;
  }
};

const getApiHost = () => {
  // GitHub redirects need the backend host without the /api suffix.
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
};

// Build the backend /auth/github URL that starts the GitHub OAuth flow.
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

// CLI-style code exchange helper; web login mainly uses the backend callback redirect.
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

// Manually refresh the browser session when needed.
export const refreshAccessToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    return response.data.user;
  } catch (error) {
    throw error;
  }
};
