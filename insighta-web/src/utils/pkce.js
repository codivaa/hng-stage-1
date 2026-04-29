// Generate random string of specified length
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

// Generate code verifier for PKCE
export function generateCodeVerifier() {
  return generateRandomString(128);
}

// Generate code challenge from code verifier
export async function generateCodeChallenge(codeVerifier) {
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

// Generate state for OAuth
export function generateState() {
  return generateRandomString(32);
}
