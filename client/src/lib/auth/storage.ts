/**
 * SessionStorage Helpers
 *
 * Manages temporary OAuth state during the redirect flow
 * IMPORTANT: Only stores temporary PKCE params, NOT tokens!
 */

const AUTH_STATE_KEY = 'auth_state';
const AUTH_NONCE_KEY = 'auth_nonce';
const AUTH_CODE_VERIFIER_KEY = 'auth_code_verifier';

export interface AuthParams {
  state: string;
  nonce: string;
  codeVerifier: string;
}

/**
 * Save auth parameters to sessionStorage
 * Used before redirecting to Auth0
 *
 * @param state - CSRF protection state
 * @param nonce - ID token validation nonce
 * @param codeVerifier - PKCE code verifier
 */
export function saveAuthParams(
  state: string,
  nonce: string,
  codeVerifier: string
): void {
  sessionStorage.setItem(AUTH_STATE_KEY, state);
  sessionStorage.setItem(AUTH_NONCE_KEY, nonce);
  sessionStorage.setItem(AUTH_CODE_VERIFIER_KEY, codeVerifier);

  console.log('[Auth Storage] Saved auth params to sessionStorage');
}

/**
 * Retrieve auth parameters from sessionStorage
 * Used after Auth0 redirects back to callback
 *
 * @returns Auth parameters or null if not found
 */
export function getAuthParams(): AuthParams | null {
  const state = sessionStorage.getItem(AUTH_STATE_KEY);
  const nonce = sessionStorage.getItem(AUTH_NONCE_KEY);
  const codeVerifier = sessionStorage.getItem(AUTH_CODE_VERIFIER_KEY);

  if (!state || !nonce || !codeVerifier) {
    console.warn('[Auth Storage] Missing auth params in sessionStorage');
    return null;
  }

  return { state, nonce, codeVerifier };
}

/**
 * Clear auth parameters from sessionStorage
 * Used after successful token exchange
 */
export function clearAuthParams(): void {
  sessionStorage.removeItem(AUTH_STATE_KEY);
  sessionStorage.removeItem(AUTH_NONCE_KEY);
  sessionStorage.removeItem(AUTH_CODE_VERIFIER_KEY);

  console.log('[Auth Storage] Cleared auth params from sessionStorage');
}

/**
 * Validate state parameter matches stored value
 * CRITICAL: Prevents CSRF attacks
 *
 * @param receivedState - State from Auth0 callback URL
 * @returns True if state matches, false otherwise
 */
export function validateState(receivedState: string): boolean {
  const storedState = sessionStorage.getItem(AUTH_STATE_KEY);

  if (!storedState) {
    console.error('[Auth Storage] No stored state found');
    return false;
  }

  if (receivedState !== storedState) {
    console.error('[Auth Storage] State mismatch - possible CSRF attack');
    return false;
  }

  console.log('[Auth Storage] State validated successfully');
  return true;
}
