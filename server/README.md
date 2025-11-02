# Dashboard Builder - Backend Server

Express TypeScript backend for handling Auth0 OAuth2 + PKCE authentication.

## Features

- **Auth0 OAuth2 + PKCE** - Secure authentication flow
- **HttpOnly Cookies** - Token storage in secure cookies
- **Token Refresh** - Automatic token rotation
- **CORS** - Configured for SPA integration
- **TypeScript** - Full type safety

## Architecture

```
/server
├── src/
│   ├── index.ts              # Express app entry point
│   ├── config/
│   │   └── auth0.ts          # Auth0 configuration
│   ├── middleware/
│   │   ├── cors.ts           # CORS configuration
│   │   ├── errorHandler.ts  # Global error handler
│   │   └── validateAuth.ts  # Auth validation (optional)
│   ├── routes/
│   │   └── auth.ts           # Auth endpoints
│   ├── utils/
│   │   ├── cookies.ts        # Cookie helpers
│   │   └── auth0Client.ts   # Auth0 API client
│   └── types/
│       └── index.ts          # TypeScript types
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Environment template
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your Auth0 credentials:

```bash
AUTH0_DOMAIN=your-tenant.eu.auth0.com
AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxx
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## API Endpoints

### POST `/api/auth/callback`

Exchanges authorization code for tokens.

**Request Body:**
```json
{
  "code": "authorization_code_from_auth0",
  "verifier": "pkce_code_verifier",
  "redirectUri": "http://localhost:5173/callback"
}
```

**Response:** `204 No Content` + HttpOnly cookies set

---

### POST `/api/auth/refresh`

Refreshes access token using refresh token from cookie.

**Request:** No body (reads `rt` cookie)

**Response:** `204 No Content` + Rotated cookies

---

### POST `/api/auth/logout`

Clears authentication cookies.

**Response:** `204 No Content`

---

### GET `/api/me`

Returns authenticated user profile.

**Request:** No body (reads `at` cookie)

**Response:**
```json
{
  "sub": "auth0|123...",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://..."
}
```

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run typecheck` - Check TypeScript types

## Security

- **HttpOnly Cookies** - Tokens not accessible via JavaScript
- **Secure Flag** - HTTPS-only in production
- **SameSite** - CSRF protection
- **CORS** - Restricted to SPA origin only
- **No Client Secret** - PKCE flow doesn't require it

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `AUTH0_DOMAIN` | Auth0 tenant domain | `your-tenant.eu.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 application client ID | `xxxxx...` |
| `APP_URL_DEV` | Frontend URL (dev) | `http://localhost:5173` |
| `COOKIE_DOMAIN_DEV` | Cookie domain (dev) | `localhost` |

## Troubleshooting

### CORS Errors

- Ensure `APP_URL_DEV` matches your frontend URL exactly
- Check that frontend includes `credentials: 'include'` on all fetch calls

### Cookies Not Set

- Verify cookie flags match environment (secure flag requires HTTPS in prod)
- Check that domain is correct for development (`localhost`)

### 401 Unauthorized

- Verify Auth0 credentials are correct
- Check that cookies are being sent from frontend
- Ensure tokens haven't expired

## Next Steps

After setting up the backend:

1. Follow Phase 14 in `/docs/AUTH_IMPLEMENTATION.md`
2. Implement auth routes and middleware
3. Test endpoints with Postman/Insomnia
4. Integrate with frontend

## Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [OAuth2 PKCE Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce)
- [Express Documentation](https://expressjs.com/)
