/**
 * Dashboard Builder - Backend Server
 *
 * Express server with Auth0 OAuth2 + PKCE authentication
 *
 * Phase 13: Basic server setup ✓
 * Phase 14: Auth routes implementation ✓
 */

import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);        // CORS with credentials
app.use(express.json());         // Parse JSON bodies
app.use(cookieParser());         // Parse cookies

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Dashboard Builder Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Dashboard Builder - Backend Server                       ║
║  Phase 13: Environment Setup ✓                            ║
║  Phase 14: Auth Routes ✓                                  ║
╠═══════════════════════════════════════════════════════════╣
║  Server:      http://localhost:${PORT}                         ║
║  Health:      http://localhost:${PORT}/health                  ║
║  Environment: ${process.env.NODE_ENV || 'development'}                           ║
╠═══════════════════════════════════════════════════════════╣
║  API Endpoints:                                            ║
║  POST /api/auth/callback - Exchange code for tokens       ║
║  POST /api/auth/refresh  - Refresh access token           ║
║  POST /api/auth/logout   - Clear cookies                  ║
║  GET  /api/me            - Get user profile               ║
╠═══════════════════════════════════════════════════════════╣
║  Next: Configure Auth0 (Phase 18)                         ║
║  Then: Implement Frontend (Phase 15-17)                   ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
