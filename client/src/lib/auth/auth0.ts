import {
  AUTH0_CLIENT_ID,
  APP_URL,
  OAUTH_SCOPES,
  AUTH0_AUTHORIZE_URL,
  AUTH0_LOGOUT_URL,
} from "@/constants/auth0";

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
    response_type: "code",
    client_id: AUTH0_CLIENT_ID,
    redirect_uri: `${APP_URL}/callback`,
    scope: OAUTH_SCOPES,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
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
