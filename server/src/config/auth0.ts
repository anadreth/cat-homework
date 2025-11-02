/**
 * Auth0 Configuration
 *
 * Centralized Auth0 settings and endpoints
 */

import dotenv from 'dotenv';

dotenv.config();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;

if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
  throw new Error(
    'Missing required Auth0 configuration. Please set AUTH0_DOMAIN and AUTH0_CLIENT_ID in .env file.'
  );
}

export const auth0Config = {
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,

  // Auth0 API endpoints
  tokenEndpoint: `https://${AUTH0_DOMAIN}/oauth/token`,
  userInfoEndpoint: `https://${AUTH0_DOMAIN}/userinfo`,
  logoutEndpoint: `https://${AUTH0_DOMAIN}/v2/logout`,
} as const;
