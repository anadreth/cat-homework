/**
 * TypeScript Type Definitions
 *
 * Shared types for the backend server
 */

// Auth0 token response from /oauth/token
export interface Auth0TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

// User profile from Auth0 /userinfo
export interface UserProfile {
  sub: string;           // Auth0 user ID
  email: string;
  email_verified?: boolean;
  name: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
}

// Request body for /api/auth/callback
export interface CallbackRequestBody {
  code: string;          // Authorization code from Auth0
  verifier: string;      // PKCE code_verifier
  redirectUri: string;   // Must match Auth0 callback URL
}

// Environment variables
export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production';
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  APP_URL_DEV: string;
  COOKIE_DOMAIN_DEV: string;
  APP_URL_PROD?: string;
  COOKIE_DOMAIN_PROD?: string;
}
