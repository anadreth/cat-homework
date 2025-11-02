/**
 * PKCE (Proof Key for Code Exchange) Utilities
 *
 * Implements OAuth2 PKCE flow using Web Crypto API
 * https://tools.ietf.org/html/rfc7636
 */

/**
 * Generate a cryptographically random string
 * @param length - Length of the random string
 * @returns Base64URL-encoded random string
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Base64URL encode (without padding)
 * @param buffer - Uint8Array to encode
 * @returns Base64URL-encoded string
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...Array.from(buffer)));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE code_verifier (43-128 characters)
 * @returns Random code verifier string
 */
export function generateCodeVerifier(): string {
  return generateRandomString(32); // 32 bytes = 43 characters when base64url encoded
}

/**
 * Generate PKCE code_challenge from code_verifier
 * Uses SHA-256 hash as per PKCE spec
 *
 * @param codeVerifier - The code verifier to hash
 * @returns Base64URL-encoded SHA-256 hash of the verifier
 */
export async function generateCodeChallenge(
  codeVerifier: string
): Promise<string> {
  // Encode the verifier as UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  // Hash with SHA-256
  const hash = await crypto.subtle.digest('SHA-256', data);

  // Base64URL encode the hash
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Generate random state parameter for CSRF protection
 * @returns Random state string
 */
export function generateState(): string {
  return generateRandomString(32);
}

/**
 * Generate random nonce for ID token validation
 * @returns Random nonce string
 */
export function generateNonce(): string {
  return generateRandomString(32);
}
