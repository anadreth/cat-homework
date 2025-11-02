# Auth0 OAuth2 + PKCE Implementation Guide

## 1. Create & Configure Your Auth0 Application

### Initial Setup

1. **Sign in to Auth0 Dashboard** → Applications → Create Application
2. **Name**: "Dashboard Builder (SPA)"
3. **Type**: Single Page Web Application

### Application Settings

Configure the following URLs in your app settings:

#### Allowed Callback URLs
Where Auth0 redirects with the authorization code:
```
http://localhost:5173/callback
https://app.example.com/callback
```

#### Allowed Logout URLs
Where users are redirected after logout:
```
http://localhost:5173/
https://app.example.com/
```

#### Allowed Web Origins (CORS)
For XHR requests from SPA to Auth0:
```
http://localhost:5173
https://app.example.com
```

#### Allowed Origins (CORS)
Same as Web Origins:
```
http://localhost:5173
https://app.example.com
```

### Advanced OAuth Settings

Navigate to **Advanced Settings** → **OAuth**:

- **OIDC Conformant**: ON (usually default)
- **Grant Types**: Authorization Code (PKCE is implicit for SPAs)
- **Refresh Token Rotation**: ON (recommended for security)

### Environment Variables

Copy these credentials to your `.env` file:

```bash
AUTH0_DOMAIN=my-tenant.eu.auth0.com
AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxx
```

**Note**: No client secret needed for SPA PKCE exchange. Your backend calls `/oauth/token` using PKCE `code_verifier`.

### Auth0 Endpoints

Automatically derived from your domain:
- **Authorize**: `https://{AUTH0_DOMAIN}/authorize`
- **Token Exchange**: `https://{AUTH0_DOMAIN}/oauth/token`
- **User Info**: `https://{AUTH0_DOMAIN}/userinfo`
- **Logout**: `https://{AUTH0_DOMAIN}/v2/logout`

**Optional**: Configure Connections, MFA, and Branding later.

## 2. Define Your App's Security Model

### Authentication Flow
- **Flow Type**: Authorization Code + PKCE
- **Token Storage**: HttpOnly, Secure, SameSite cookies (set by backend)
- **SPA Behavior**: Never stores tokens directly

### Token Configuration
- **Access Token TTL**: 5–10 minutes (short-lived)
- **Refresh Token**: Rotation enabled for security
- **Scopes**: `openid profile email` (add API scopes later)

---

## 3. Express Backend (Token Exchange + Cookies)

### 3.1 Environment Variables

Create a `.env` file in `/server`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.eu.auth0.com
AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxx

# Application URLs
APP_URL_DEV=http://localhost:5173
COOKIE_DOMAIN_DEV=localhost

# Production (when deployed)
APP_URL_PROD=https://yourdomain.com
COOKIE_DOMAIN_PROD=.yourdomain.com
```

**Note**: No client secret needed for SPA + PKCE code exchange.

### 3.2 Backend Routes

Your Express backend must expose these routes:

#### POST `/api/auth/callback`
Exchanges authorization code for tokens.

**Input** (from SPA):
```typescript
{
  code: string;           // Authorization code from Auth0
  verifier: string;       // PKCE code_verifier
  redirectUri: string;    // Must match Auth0 callback URL
}
```

**Action**:
1. POST to `https://{AUTH0_DOMAIN}/oauth/token` with:
   ```json
   {
     "grant_type": "authorization_code",
     "client_id": "{AUTH0_CLIENT_ID}",
     "code": "{code}",
     "code_verifier": "{verifier}",
     "redirect_uri": "{redirectUri}"
   }
   ```

**Result**:
- Set HttpOnly cookies:
  - `at` (access token) — 5-10 min TTL
  - `rt` (refresh token) — 7 days TTL
- Return `204 No Content`

#### POST `/api/auth/refresh`
Refreshes access token using refresh token.

**Input**: Reads `rt` cookie automatically

**Action**:
1. POST to `https://{AUTH0_DOMAIN}/oauth/token` with:
   ```json
   {
     "grant_type": "refresh_token",
     "client_id": "{AUTH0_CLIENT_ID}",
     "refresh_token": "{rt_cookie}"
   }
   ```

**Result**:
- Rotate cookies (new `at`, new `rt`)
- Return `204 No Content`

#### POST `/api/auth/logout`
Clears authentication cookies.

**Action**:
- Clear `at` and `rt` cookies
- Optionally redirect to:
  ```
  https://{AUTH0_DOMAIN}/v2/logout?returnTo={APP_URL}
  ```

**Result**: `204 No Content`

#### GET `/api/me`
Returns authenticated user profile.

**Input**: Reads `at` cookie automatically

**Action**:
1. Call `https://{AUTH0_DOMAIN}/userinfo` with:
   ```
   Authorization: Bearer {at_cookie}
   ```

**Result**: JSON user profile
```json
{
  "sub": "auth0|123...",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://..."
}
```

### 3.3 Cookie Settings (Critical)

All cookies must use these security flags:

```typescript
const cookieOptions = {
  httpOnly: true,        // Prevents JavaScript access
  secure: true,          // HTTPS only (required in production)
  sameSite: 'lax',       // CSRF protection ('strict' also works)
  domain: 'localhost',   // Development domain
  path: '/',             // Available to all routes
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days for refresh token
};
```

### 3.4 CORS Configuration

Enable credentials to allow browser to send cookies:

```typescript
const corsOptions = {
  origin: 'http://localhost:5173',  // Development SPA URL
  credentials: true,                 // CRITICAL: allows cookies
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 4. React App (SPA) Responsibilities

### 4.1 Start Login Flow

When user clicks "Login" button:

**Generate Security Parameters:**
```typescript
const state = generateRandomString();        // CSRF protection
const nonce = generateRandomString();        // ID token validation
const code_verifier = generateCodeVerifier(); // PKCE verifier
const code_challenge = await generateCodeChallenge(code_verifier); // SHA-256 hash
```

**Store in SessionStorage:**
```typescript
sessionStorage.setItem('auth_state', state);
sessionStorage.setItem('auth_nonce', nonce);
sessionStorage.setItem('auth_code_verifier', code_verifier);
```

**Redirect to Auth0:**
```typescript
const params = new URLSearchParams({
  response_type: 'code',
  client_id: AUTH0_CLIENT_ID,
  redirect_uri: `${APP_URL}/callback`,
  scope: 'openid profile email',
  state: state,
  nonce: nonce,
  code_challenge: code_challenge,
  code_challenge_method: 'S256'
});

window.location.href = `https://${AUTH0_DOMAIN}/authorize?${params}`;
```

### 4.2 Callback Route `/callback`

Handle Auth0 redirect:

**Read URL Parameters:**
```typescript
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');
```

**Validate State (CSRF Protection):**
```typescript
const storedState = sessionStorage.getItem('auth_state');
if (state !== storedState) {
  throw new Error('State mismatch - possible CSRF attack');
}
```

**Retrieve Code Verifier:**
```typescript
const code_verifier = sessionStorage.getItem('auth_code_verifier');
```

**Exchange Code for Tokens:**
```typescript
const response = await fetch('http://localhost:3000/api/auth/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // CRITICAL: include cookies
  body: JSON.stringify({
    code,
    verifier: code_verifier,
    redirectUri: `${APP_URL}/callback`
  })
});

if (response.status === 204) {
  // Success! Cookies are set
  sessionStorage.clear(); // Clean up temp data
  window.location.href = '/dashboard'; // Redirect to app
}
```

### 4.3 Using the Session in SPA

**All API Calls Must Include Credentials:**
```typescript
const response = await fetch('http://localhost:3000/api/me', {
  credentials: 'include'  // Sends cookies automatically
});
```

**Auto-Refresh on 401:**
```typescript
async function apiCall(url: string, options?: RequestInit) {
  let response = await fetch(url, {
    ...options,
    credentials: 'include'
  });

  // If unauthorized, try refresh once
  if (response.status === 401) {
    await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    // Retry original request
    response = await fetch(url, {
      ...options,
      credentials: 'include'
    });
  }

  return response;
}
```

### 4.4 Logout

**Clear Session:**
```typescript
await fetch('http://localhost:3000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});

// Optionally: redirect to Auth0 logout to end IdP session
window.location.href = `https://${AUTH0_DOMAIN}/v2/logout?returnTo=${APP_URL}&client_id=${AUTH0_CLIENT_ID}`;
```

---

## 5. Development URLs

### Explicit URL Configuration

| Service | Development URL |
|---------|----------------|
| **Frontend (SPA)** | `http://localhost:5173` |
| **Backend (API)** | `http://localhost:3000` |
| **Callback URL** | `http://localhost:5173/callback` |
| **Logout Return URL** | `http://localhost:5173/` |

**Important**: All Auth0 settings (callback URLs, logout URLs, web origins, CORS) must include these exact URLs.

---

## 6. Security Hardening Checklist

### ✅ MUST IMPLEMENT

- [x] **Authorization Code + PKCE** (never use Implicit flow)
- [x] **HttpOnly, Secure, SameSite cookies** for token storage
- [x] **Short Access Token TTL** (5–10 minutes)
- [x] **Refresh Token Rotation** enabled
- [x] **Validate `state` parameter** (CSRF protection)
- [x] **Use `nonce`** for OIDC ID token validation
- [x] **CORS**: Only allow SPA origin with `credentials: true`
- [x] **CSP**: No `unsafe-inline`, lock down `connect-src` to API and Auth0
- [x] **No tokens in localStorage/sessionStorage** (except temporary PKCE params)
- [x] **Auth0 session logout** (optional but recommended)

### ❌ NEVER DO

- Never store access/refresh tokens in localStorage
- Never use Implicit flow
- Never skip state validation
- Never allow wildcard CORS origins
- Never commit `.env` files to git
- Never use client secret in SPA code

---

## 7. Optional: Custom API Integration

If you have your own Resource Server (API):

### Auth0 API Configuration

1. **Create API** in Auth0 Dashboard → APIs
2. **Set Audience**: `https://api.example.com`
3. **Request Scope** during `/authorize`:
   ```typescript
   scope: 'openid profile email read:api write:api'
   ```

### Backend as BFF (Backend for Frontend)

Your Express backend can:
- Use the `at` cookie to call your custom API
- Mint a separate Access Token via refresh flow
- Act as a proxy between SPA and Resource Server

---

## 8. Testing Plan

### 8.1 Manual Testing Checklist

| Test Case | Expected Result |
|-----------|-----------------|
| Click Login → Auth0 screen → callback → dashboard | User lands on dashboard authenticated |
| Open DevTools → check localStorage | No tokens visible (only sessionStorage during redirect) |
| Open DevTools → check cookies | `at` and `rt` cookies exist (HttpOnly, cannot view value) |
| Call `/api/me` | Returns user profile JSON |
| Wait for AT expiry | API returns 401 → auto-refresh → retry succeeds |
| Close browser → reopen app | Still logged in (if RT valid) |
| Click Logout | Cookies cleared → `/api/me` returns 401 |
| Auth0 logout → click Login again | Must re-authenticate (no auto-login) |

### 8.2 Automated Testing

#### Unit Tests
**Backend (Jest/Vitest):**
- PKCE helper functions
- Cookie helper functions
- Auth0 API client utilities

**Frontend (Vitest + RTL):**
- PKCE generation utilities
- SessionStorage helpers
- State validation logic

#### Integration Tests
**Backend:**
- Auth routes with mocked Auth0 API
- Token rotation logic
- Cookie setting/clearing

**Frontend:**
- CallbackPage validates state correctly
- CallbackPage handles errors (invalid code, state mismatch)
- API client retries on 401
- AuthContext provides correct state

#### E2E Tests (Playwright)
- Full login flow with Auth0 test credentials
- `/api/me` returns user profile
- Token refresh on expiry
- Logout clears session
- Protected routes redirect when unauthenticated

---

## 9. Common Pitfalls & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| **CORS 401/blocked** | Missing `credentials: 'include'` on fetch or API doesn't allow credentials/origin | Add `credentials: true` to CORS config and `credentials: 'include'` to all fetch calls |
| **Cookie not set** | Missing `Secure` flag with HTTPS in production, wrong domain, or path issues | Use correct cookie flags for environment; verify domain matches |
| **Auth0 "Mismatch redirect_uri"** | Callback URL doesn't exactly match Auth0 settings | Ensure exact match including protocol, domain, port, and path |
| **Endless 302 loop** | Not validating state, or backend failing token exchange silently | Validate state parameter; add error handling to token exchange |
| **Refresh not rotating** | Not storing new `refresh_token` cookie from Auth0 response | Save both new `at` and `rt` cookies on refresh response |
| **Tokens in DevTools** | Storing tokens in localStorage/sessionStorage | Only use HttpOnly cookies; sessionStorage only for PKCE params during redirect |

---

## 10. Minimal Deliverables Checklist

### Auth0 Configuration
- [ ] Auth0 application created (SPA type)
- [ ] Callback URLs configured
- [ ] Logout URLs configured
- [ ] Web Origins configured
- [ ] Refresh Token Rotation enabled
- [ ] Credentials documented in `.env`

### Backend Implementation
- [ ] `/api/auth/callback` endpoint (token exchange)
- [ ] `/api/auth/refresh` endpoint (token rotation)
- [ ] `/api/auth/logout` endpoint (clear cookies)
- [ ] `/api/me` endpoint (user profile)
- [ ] Cookies set with proper flags (`httpOnly`, `secure`, `sameSite`)
- [ ] CORS configured with `credentials: true`
- [ ] Error handling middleware

### Frontend Implementation
- [ ] Login button redirects to Auth0 with PKCE
- [ ] State, nonce, code_verifier generated and stored
- [ ] Callback page validates state
- [ ] Callback page posts code + verifier to backend
- [ ] API client includes `credentials: 'include'`
- [ ] Auto-refresh on 401 (one retry)
- [ ] Logout button clears session
- [ ] Protected routes redirect to login

### Security & Best Practices
- [ ] CSP configured (no `unsafe-inline`)
- [ ] CORS restricted to SPA origin only
- [ ] No tokens in localStorage/sessionStorage (except temp PKCE)
- [ ] Short AT TTL (5-10 min)
- [ ] Refresh Token Rotation enabled
- [ ] `.env` files in `.gitignore`

### Testing
- [ ] Manual testing checklist completed
- [ ] Unit tests for PKCE/cookie utilities
- [ ] Integration tests for auth routes
- [ ] E2E test for full login flow
- [ ] All tests passing

---

## Summary

This guide provides a complete implementation plan for secure OAuth2 + PKCE authentication using Auth0. Follow each section carefully, ensuring all security best practices are implemented. The result will be a production-ready authentication system with proper token management, CSRF protection, and secure cookie handling.