function generateRandomString(length) {
  // Generate OAuth-safe random text for state and PKCE.
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export function generateCodeVerifier() {
  // The verifier stays with the app and is later used to prove the login request.
  return generateRandomString(64);
}

export async function generateCodeChallenge(codeVerifier) {
  // The challenge is sent first; GitHub/backend later validates it against the verifier.
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
  // State helps confirm the callback belongs to this exact login attempt.
  return generateRandomString(32);
}
