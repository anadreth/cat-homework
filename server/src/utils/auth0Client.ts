/**
 * Auth0 API Client Utilities
 *
 * Functions for interacting with Auth0 API endpoints
 */

import axios from 'axios';
import { auth0Config } from '../config/auth0';
import { Auth0TokenResponse, UserProfile } from '../types';

/**
 * Exchange authorization code for tokens
 *
 * @param code - Authorization code from Auth0
 * @param codeVerifier - PKCE code_verifier
 * @param redirectUri - Must match Auth0 callback URL exactly
 * @returns Auth0 token response with access_token, refresh_token, id_token
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<Auth0TokenResponse> {
  try {
    console.log('[Auth0] Exchanging authorization code for tokens...');

    const response = await axios.post<Auth0TokenResponse>(
      auth0Config.tokenEndpoint,
      {
        grant_type: 'authorization_code',
        client_id: auth0Config.clientId,
        code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Auth0] Token exchange successful');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[Auth0] Token exchange failed:', error.response?.data);
      throw new Error(`Auth0 token exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 *
 * @param refreshToken - Refresh token from cookie
 * @returns Auth0 token response with new access_token and refresh_token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<Auth0TokenResponse> {
  try {
    console.log('[Auth0] Refreshing access token...');

    const response = await axios.post<Auth0TokenResponse>(
      auth0Config.tokenEndpoint,
      {
        grant_type: 'refresh_token',
        client_id: auth0Config.clientId,
        refresh_token: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Auth0] Token refresh successful');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[Auth0] Token refresh failed:', error.response?.data);
      throw new Error(`Auth0 token refresh failed: ${error.response?.data?.error_description || error.message}`);
    }
    throw error;
  }
}

/**
 * Get user profile from Auth0
 *
 * @param accessToken - Access token from cookie
 * @returns User profile information
 */
export async function getUserInfo(
  accessToken: string
): Promise<UserProfile> {
  try {
    console.log('[Auth0] Fetching user info...');

    const response = await axios.get<UserProfile>(
      auth0Config.userInfoEndpoint,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log('[Auth0] User info retrieved successfully');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[Auth0] User info fetch failed:', error.response?.data);
      throw new Error(`Auth0 user info fetch failed: ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
}
