/**
 * Dashboard Builder - Backend Server
 *
 * Express server with Auth0 OAuth2 + PKCE authentication
 *
 * Phase 13: Basic server setup (placeholder)
 * Phase 14: Auth routes implementation (next phase)
 */

import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (will be expanded in Phase 14)
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Dashboard Builder Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Placeholder for auth routes (Phase 14)
app.all('/api/auth/*', (_req, res) => {
  res.status(501).json({
    error: 'Auth routes not implemented yet',
    message: 'See Phase 14 in AUTH_IMPLEMENTATION.md'
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Dashboard Builder - Backend Server                       ║
║  Phase 13: Environment Setup ✓                            ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                 ║
║  Health check:      http://localhost:${PORT}/health          ║
║  Environment:       ${process.env.NODE_ENV || 'development'}                   ║
╠═══════════════════════════════════════════════════════════╣
║  Next: Implement Phase 14 (Auth Routes)                   ║
║  See: /docs/AUTH_IMPLEMENTATION.md                        ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
