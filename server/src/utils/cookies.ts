/**
 * Cookie Utility Functions
 *
 * Handles secure cookie creation and deletion for tokens
 */

import { Response, CookieOptions } from 'express';

const isDev = process.env.NODE_ENV !== 'production';

// Base cookie options
const baseCookieOptions: CookieOptions = {
  httpOnly: true,        // Prevents JavaScript access (XSS protection)
  secure: !isDev,        // HTTPS only in production
  sameSite: 'lax',       // CSRF protection
  path: '/',             // Available to all routes
  domain: isDev
    ? process.env.COOKIE_DOMAIN_DEV || 'localhost'
    : process.env.COOKIE_DOMAIN_PROD || '.yourdomain.com',
};

/**
 * Set authentication cookies
 * @param res - Express response object
 * @param accessToken - Access token (short-lived, 5-10 min)
 * @param refreshToken - Refresh token (long-lived, 7 days)
 */
export function setCookies(
  res: Response,
  accessToken: string,
  refreshToken?: string
): void {
  // Access token - short TTL (10 minutes)
  res.cookie('at', accessToken, {
    ...baseCookieOptions,
    maxAge: 10 * 60 * 1000, // 10 minutes in milliseconds
  });

  // Refresh token - longer TTL (7 days)
  if (refreshToken) {
    res.cookie('rt', refreshToken, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
  }

  console.log('[Cookies] Set access token (10 min) and refresh token (7 days)');
}

/**
 * Clear authentication cookies
 * @param res - Express response object
 */
export function clearCookies(res: Response): void {
  res.clearCookie('at', baseCookieOptions);
  res.clearCookie('rt', baseCookieOptions);

  console.log('[Cookies] Cleared authentication cookies');
}
