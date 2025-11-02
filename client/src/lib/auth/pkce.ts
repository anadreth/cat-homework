/**
 * PKCE (Proof Key for Code Exchange) Utilities
 *
 * Implements OAuth2 PKCE flow using Web Crypto API
 * https://tools.ietf.org/html/rfc7636
 */

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...Array.from(buffer)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function generateCodeVerifier(): string {
  return generateRandomString(32); // 32 bytes = 43 characters when base64url encoded
}

export async function generateCodeChallenge(
  codeVerifier: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  const hash = await crypto.subtle.digest("SHA-256", data);

  return base64URLEncode(new Uint8Array(hash));
}

export function generateState(): string {
  return generateRandomString(32);
}

export function generateNonce(): string {
  return generateRandomString(32);
}
