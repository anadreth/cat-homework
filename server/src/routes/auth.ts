/**
 * Authentication Routes
 *
 * Handles OAuth2 + PKCE authentication flow with Auth0
 */

import { Router, Request, Response } from 'express';
import { exchangeCodeForTokens, refreshAccessToken, getUserInfo } from '../utils/auth0Client';
import { setCookies, clearCookies } from '../utils/cookies';
import { CallbackRequestBody } from '../types';

const router = Router();

/**
 * POST /api/auth/callback
 *
 * Exchanges authorization code for tokens
 * Sets HttpOnly cookies with access_token and refresh_token
 */
router.post('/callback', async (req: Request<{}, {}, CallbackRequestBody>, res: Response) => {
  try {
    const { code, verifier, redirectUri } = req.body;

    // Validate request body
    if (!code || !verifier || !redirectUri) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'code, verifier, and redirectUri are required',
      });
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code, verifier, redirectUri);

    // Set cookies with tokens
    setCookies(res, tokenResponse.access_token, tokenResponse.refresh_token);

    // Return 204 No Content (cookies are set)
    return res.status(204).send();
  } catch (error) {
    console.error('[Auth Callback] Error:', error);
    return res.status(500).json({
      error: 'Token exchange failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/refresh
 *
 * Refreshes access token using refresh token from cookie
 * Rotates cookies with new tokens
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.rt;

    // Validate refresh token exists
    if (!refreshToken) {
      return res.status(401).json({
        error: 'No refresh token',
        message: 'Refresh token cookie not found',
      });
    }

    // Refresh access token
    const tokenResponse = await refreshAccessToken(refreshToken);

    // Rotate cookies with new tokens
    setCookies(res, tokenResponse.access_token, tokenResponse.refresh_token);

    console.log('[Auth Refresh] Token rotation successful');

    // Return 204 No Content (cookies are set)
    return res.status(204).send();
  } catch (error) {
    console.error('[Auth Refresh] Error:', error);

    // Clear invalid cookies
    clearCookies(res);

    return res.status(401).json({
      error: 'Token refresh failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/logout
 *
 * Clears authentication cookies
 */
router.post('/logout', (_req: Request, res: Response) => {
  try {
    clearCookies(res);

    console.log('[Auth Logout] User logged out successfully');

    // Return 204 No Content
    return res.status(204).send();
  } catch (error) {
    console.error('[Auth Logout] Error:', error);
    return res.status(500).json({
      error: 'Logout failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/me
 *
 * Returns authenticated user profile
 * Requires valid access token in cookie
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const accessToken = req.cookies.at;

    // Validate access token exists
    if (!accessToken) {
      return res.status(401).json({
        error: 'No access token',
        message: 'Access token cookie not found',
      });
    }

    // Get user info from Auth0
    const userProfile = await getUserInfo(accessToken);

    console.log('[Auth Me] User profile retrieved:', userProfile.email);

    // Return user profile
    return res.json(userProfile);
  } catch (error) {
    console.error('[Auth Me] Error:', error);

    return res.status(401).json({
      error: 'Failed to get user info',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
