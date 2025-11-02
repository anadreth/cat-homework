export const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || 'placeholder.auth0.com';
export const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || 'placeholder_client_id';
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export const AUTH0_AUTHORIZE_URL = `https://${AUTH0_DOMAIN}/authorize`;
export const AUTH0_LOGOUT_URL = `https://${AUTH0_DOMAIN}/v2/logout`;

export const OAUTH_SCOPES = 'openid profile email';

export const AUTH_STATE_KEY = 'auth_state';
export const AUTH_NONCE_KEY = 'auth_nonce';
export const AUTH_CODE_VERIFIER_KEY = 'auth_code_verifier';