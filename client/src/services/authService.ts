/**
 * Authentication Service
 *
 * Handles OAuth flow logic OUTSIDE of Redux
 * IMPORTANT: Keep redirects and OAuth flow logic separate from Redux state
 */

import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
} from '@/lib/auth/pkce';
import {
  saveAuthParams,
  getAuthParams,
  clearAuthParams,
  validateState,
} from '@/lib/auth/storage';
import { buildAuthorizeUrl, buildLogoutUrl, APP_URL } from '@/lib/auth/auth0';
import { apiClient } from '@/lib/api/client';

/**
 * Initiate OAuth login flow
 * Generates PKCE params, saves to sessionStorage, and redirects to Auth0
 *
 * ❌ DO NOT call from Redux actions
 * ✅ Call directly from components (e.g., login button onClick)
 */
export function initiateLogin(): void {
  console.log('[Auth Service] Initiating login flow...');

  // Generate PKCE parameters
  const state = generateState();
  const nonce = generateNonce();
  const codeVerifier = generateCodeVerifier();

  // Generate code_challenge from verifier
  generateCodeChallenge(codeVerifier).then((codeChallenge) => {
    // Save to sessionStorage
    saveAuthParams(state, nonce, codeVerifier);

    // Build Auth0 URL
    const authorizeUrl = buildAuthorizeUrl(state, nonce, codeChallenge);

    console.log('[Auth Service] Redirecting to Auth0...');

    // Redirect to Auth0 (side effect, not Redux)
    window.location.href = authorizeUrl;
  });
}

/**
 * Handle OAuth callback
 * Validates state, exchanges code for tokens
 *
 * @param code - Authorization code from Auth0
 * @param state - State parameter from Auth0
 * @returns Success status
 */
export async function handleCallback(
  code: string,
  state: string
): Promise<{ success: boolean; error?: string }> {
  console.log('[Auth Service] Handling OAuth callback...');

  try {
    // Validate state (CSRF protection)
    if (!validateState(state)) {
      return {
        success: false,
        error: 'State mismatch - possible CSRF attack',
      };
    }

    // Retrieve auth params from sessionStorage
    const authParams = getAuthParams();
    if (!authParams) {
      return {
        success: false,
        error: 'Missing auth params in sessionStorage',
      };
    }

    // Exchange code for tokens
    const response = await apiClient.post('/api/auth/callback', {
      code,
      verifier: authParams.codeVerifier,
      redirectUri: `${APP_URL}/callback`,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Auth Service] Token exchange failed:', error);
      return {
        success: false,
        error: error.message || 'Token exchange failed',
      };
    }

    // Clear sessionStorage
    clearAuthParams();

    console.log('[Auth Service] OAuth callback handled successfully');

    return { success: true };
  } catch (error) {
    console.error('[Auth Service] Callback error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Initiate Auth0 logout
 * Redirects to Auth0 logout URL which clears IdP session
 *
 * Note: This is OPTIONAL - you can just clear cookies via /api/auth/logout
 */
export function initiateAuth0Logout(): void {
  console.log('[Auth Service] Redirecting to Auth0 logout...');
  window.location.href = buildLogoutUrl();
}
