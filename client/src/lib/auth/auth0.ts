/**
 * Auth0 Client Configuration
 *
 * Centralized Auth0 settings for frontend
 */

// Auth0 configuration from environment variables
export const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || 'placeholder.auth0.com';
export const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || 'placeholder_client_id';
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

// Auth0 endpoints
export const AUTH0_AUTHORIZE_URL = `https://${AUTH0_DOMAIN}/authorize`;
export const AUTH0_LOGOUT_URL = `https://${AUTH0_DOMAIN}/v2/logout`;

// OAuth scopes
export const OAUTH_SCOPES = 'openid profile email';

/**
 * Build Auth0 authorization URL with PKCE parameters
 *
 * @param state - Random state for CSRF protection
 * @param nonce - Random nonce for ID token validation
 * @param codeChallenge - SHA-256 hash of code_verifier
 * @returns Complete Auth0 authorize URL
 */
export function buildAuthorizeUrl(
  state: string,
  nonce: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: AUTH0_CLIENT_ID,
    redirect_uri: `${APP_URL}/callback`,
    scope: OAUTH_SCOPES,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${AUTH0_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * Build Auth0 logout URL
 * @returns Auth0 logout URL that redirects back to app
 */
export function buildLogoutUrl(): string {
  const params = new URLSearchParams({
    returnTo: APP_URL,
    client_id: AUTH0_CLIENT_ID,
  });

  return `${AUTH0_LOGOUT_URL}?${params.toString()}`;
}
