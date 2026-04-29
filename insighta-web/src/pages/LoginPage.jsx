import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import * as authService from '../services/auth';
import { generateCodeVerifier } from '../utils/pkce';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginSuccess } = useContext(AuthContext);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      handleCallback(code, state);
    }
  }, [searchParams]);

  const handleCallback = async (code, state) => {
    try {
      setLoading(true);
      // Retrieve code verifier from sessionStorage
      const codeVerifier = sessionStorage.getItem(`pkce_verifier_${state}`);

      if (!codeVerifier) {
        setError('Invalid authentication state');
        return;
      }

      const user = await authService.exchangeCode(code, codeVerifier);
      loginSuccess(user);

      // Clean up
      sessionStorage.removeItem(`pkce_verifier_${state}`);

      navigate('/dashboard');
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      const { generateCodeChallenge } = await import('../utils/pkce');
      const { generateState } = await import('../utils/pkce');

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateState();

      // Store verifier for later use
      sessionStorage.setItem(`pkce_verifier_${state}`, codeVerifier);

      const authUrl = authService.getGithubAuthUrl(state, codeChallenge);
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to initiate login');
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '10px', color: 'var(--primary-color)' }}>
            Insighta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Profile Analytics Platform
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGithubLogin}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '16px', marginBottom: '20px' }}
        >
          {loading ? (
            <>
              <div className="loading" style={{ width: '16px', height: '16px' }}></div>
              Signing in...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.544 2.914 1.19.092-.926.35-1.545.636-1.899-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.163 20 14.413 20 10c0-5.523-4.477-10-10-10z" />
              </svg>
              Sign in with GitHub
            </>
          )}
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)'
        }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
