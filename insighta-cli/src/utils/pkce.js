function generateRandomString(length) {
  // Generate random OAuth-safe text for state and PKCE verifier values.
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export function generateCodeVerifier() {
  // The verifier is kept by the app/CLI and later proves the login request is valid.
  return generateRandomString(64);
}

export async function generateCodeChallenge(codeVerifier) {
  // The challenge is a SHA-256 hash of the verifier, encoded in URL-safe base64.
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashString = hashArray.map(b => String.fromCharCode(b)).join('');
  const base64 = btoa(hashString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return base64;
}

export function generateState() {
  // State protects against accepting a callback from the wrong login attempt.
  return generateRandomString(32);
}
