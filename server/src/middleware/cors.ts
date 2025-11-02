/**
 * CORS Middleware Configuration
 *
 * Enables CORS with credentials for SPA authentication
 */

import cors from 'cors';

const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigin = isDev
  ? process.env.APP_URL_DEV || 'http://localhost:5173'
  : process.env.APP_URL_PROD || 'https://yourdomain.com';

export const corsMiddleware = cors({
  origin: allowedOrigin,
  credentials: true,           // CRITICAL: Allows cookies to be sent/received
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

console.log(`[CORS] Configured for origin: ${allowedOrigin}`);
