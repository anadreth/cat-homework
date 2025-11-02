# Authentication Implementation - Step-by-Step

This document provides a detailed, phased implementation plan for adding Auth0 OAuth2 + PKCE authentication to the Dashboard Builder project.

**Reference**: See [oauth2-guide.md](./oauth2-guide.md) for the complete technical guide.

---

## Phase 13 — Backend Scaffold & Environment Setup

### Goals
- Create Express TypeScript server structure
- Configure development environment
- Set up basic project files

### Tasks

- [ ] Create `/server` directory structure:
  ```
  /server
  ├── src/
  ├── package.json
  ├── tsconfig.json
  ├── nodemon.json
  ├── .env.example
  ├── .gitignore
  └── README.md
  ```

- [ ] Initialize Node project:
  ```bash
  cd server
  npm init -y
  ```

- [ ] Install production dependencies:
  ```bash
  npm install express cors cookie-parser dotenv axios
  ```

- [ ] Install development dependencies:
  ```bash
  npm install -D typescript @types/node @types/express @types/cors @types/cookie-parser nodemon tsx
  ```

- [ ] Create `tsconfig.json`:
  - `target`: ES2020
  - `module`: commonjs
  - `outDir`: ./dist
  - `rootDir`: ./src
  - `strict`: true

- [ ] Create `nodemon.json` for hot-reload:
  ```json
  {
    "watch": ["src"],
    "ext": "ts",
    "exec": "tsx src/index.ts"
  }
  ```

- [ ] Create `.env.example` with all required variables:
  - PORT
  - NODE_ENV
  - AUTH0_DOMAIN
  - AUTH0_CLIENT_ID
  - APP_URL_DEV
  - COOKIE_DOMAIN_DEV

- [ ] Add `.env` to `.gitignore`

- [ ] Add npm scripts to `package.json`:
  - `dev`: nodemon
  - `build`: tsc
  - `start`: node dist/index.js

### Acceptance Criteria
- [ ] `/server` folder structure created
- [ ] All dependencies installed
- [ ] TypeScript configured
- [ ] Dev environment ready to run

---

## Phase 14 — Backend Auth Routes Implementation

### Goals
- Implement all auth-related API endpoints
- Set up Auth0 integration
- Configure cookie and CORS middleware

### Tasks

#### 14.1 Core Server Setup

- [ ] Create `src/index.ts`:
  - Initialize Express app
  - Apply middleware (cors, cookie-parser, json)
  - Mount auth routes
  - Add error handling middleware
  - Start server on PORT

- [ ] Create `src/config/auth0.ts`:
  - Export Auth0 configuration object
  - Include domain, client_id, token endpoint, userinfo endpoint

- [ ] Create `src/middleware/cors.ts`:
  - Configure CORS with `credentials: true`
  - Allow origin from APP_URL_DEV
  - Set optionsSuccessStatus: 200

- [ ] Create `src/middleware/errorHandler.ts`:
  - Global error handler
  - Log errors to console
  - Return appropriate JSON error responses

#### 14.2 Utility Functions

- [ ] Create `src/utils/cookies.ts`:
  - `setCookies(res, at, rt)` function
  - `clearCookies(res)` function
  - Cookie options with httpOnly, secure, sameSite, domain, path

- [ ] Create `src/utils/auth0Client.ts`:
  - `exchangeCodeForTokens(code, verifier, redirectUri)` function
  - `refreshAccessToken(refreshToken)` function
  - `getUserInfo(accessToken)` function
  - Use axios for Auth0 API calls

#### 14.3 Auth Routes

- [ ] Create `src/routes/auth.ts`:
  - Express router instance

- [ ] Implement `POST /api/auth/callback`:
  - Validate request body (code, verifier, redirectUri)
  - Call `exchangeCodeForTokens` utility
  - Set cookies with access_token and refresh_token
  - Return 204 on success
  - Handle errors (400, 500)

- [ ] Implement `POST /api/auth/refresh`:
  - Read `rt` cookie from request
  - Validate cookie exists
  - Call `refreshAccessToken` utility
  - Rotate cookies (new at, new rt)
  - Return 204 on success
  - Handle errors (401, 500)

- [ ] Implement `POST /api/auth/logout`:
  - Clear `at` and `rt` cookies
  - Return 204
  - Handle errors (500)

- [ ] Implement `GET /api/me`:
  - Read `at` cookie from request
  - Validate cookie exists
  - Call `getUserInfo` utility
  - Return user profile JSON
  - Handle errors (401, 500)

#### 14.4 Type Definitions

- [ ] Create `src/types/index.ts`:
  - Auth0TokenResponse interface
  - UserProfile interface
  - Request body types

### Acceptance Criteria
- [ ] Server starts on port 3000
- [ ] All 4 auth routes responding
- [ ] CORS configured correctly
- [ ] Cookies set with proper flags
- [ ] Error handling working
- [ ] TypeScript types defined
 
### Testing Checklist
- [ ] Test with Postman/Insomnia
- [ ] Verify cookie flags in response
- [ ] Verify CORS headers present
- [ ] Test error cases (invalid code, missing cookies)

---

## Phase 15 — Frontend Auth Utilities (PKCE, Storage, API Client)

### Goals
- Create PKCE code generation utilities
- Implement sessionStorage helpers
- Build API client with auto-refresh

### Tasks

#### 15.1 PKCE Utilities

- [ ] Create `client/src/lib/auth/pkce.ts`:
  - `generateRandomString(length)` function using crypto.getRandomValues
  - `base64URLEncode(array)` function
  - `generateCodeVerifier()` function (43-character random string)
  - `generateCodeChallenge(verifier)` async function
    - Use crypto.subtle.digest('SHA-256', verifier)
    - Return base64URL-encoded hash

#### 15.2 SessionStorage Helpers

- [ ] Create `client/src/lib/auth/storage.ts`:
  - `saveAuthParams(state, nonce, codeVerifier)` function
  - `getAuthParams()` function → returns object
  - `clearAuthParams()` function
  - Use sessionStorage for temporary data during OAuth flow

#### 15.3 Auth0 Client Config

- [ ] Create `client/src/lib/auth/auth0.ts`:
  - Export AUTH0_DOMAIN constant
  - Export AUTH0_CLIENT_ID constant
  - Export APP_URL constant
  - `buildAuthorizeUrl(state, nonce, codeChallenge)` function
    - Returns full Auth0 authorize URL with all params

#### 15.4 API Client

- [ ] Create `client/src/lib/api/client.ts`:
  - `API_BASE_URL` constant (http://localhost:3000)
  - `apiClient` object with methods:
    - `get(path)` - GET request with credentials
    - `post(path, body)` - POST request with credentials
    - Auto-refresh on 401 (one retry)
    - Throw errors for other status codes
  - All requests must include `credentials: 'include'`

### Acceptance Criteria
- [ ] PKCE functions generate valid codes
- [ ] SessionStorage helpers work
- [ ] Auth0 URLs build correctly
- [ ] API client handles 401 refresh
- [ ] All TypeScript types defined

### Testing Checklist
- [ ] Unit test PKCE code generation
- [ ] Unit test code_challenge matches verifier
- [ ] Unit test sessionStorage helpers
- [ ] Test API client with mock fetch

---

## Phase 16 — Frontend Auth State with Redux Toolkit

### Goals
- Create Redux slice for auth state
- Implement listener middleware for auto-refresh
- Manage login/logout/user state in Redux

### Important: What NOT to Store in Redux

**❌ DO NOT PUT IN REDUX:**
- Access/refresh tokens (they're in HttpOnly cookies on backend)
- PKCE verifier (keep in sessionStorage just for OAuth redirect)
- Any secrets or sensitive data

**✅ DO PUT IN REDUX:**
- User profile data (name, email, picture, etc.)
- Authentication status (isAuthenticated, isLoading)
- Auth errors (if any)

### Tasks

#### 16.1 Auth Slice

- [ ] Create `client/src/store/slices/authSlice.ts`:
  - Define `AuthState` interface:
    ```typescript
    interface AuthState {
      user: User | null;
      isLoading: boolean;
      isAuthenticated: boolean;
      error: string | null;
    }
    ```
  - Define `User` interface:
    ```typescript
    interface User {
      sub: string;        // Auth0 user ID
      email: string;
      name: string;
      picture?: string;
    }
    ```
  - Initial state:
    ```typescript
    const initialState: AuthState = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    };
    ```
  - Create async thunks:
    - `fetchUserProfile`: GET /api/me with credentials
    - `logout`: POST /api/auth/logout with credentials
  - Create slice with reducers:
    - Handle thunk pending/fulfilled/rejected states
    - `clearError`: clear error state
  - Export actions and selectors:
    - `selectUser`
    - `selectIsAuthenticated`
    - `selectIsLoading`
    - `selectAuthError`

#### 16.2 Auth Listener Middleware (Token Refresh)

- [ ] Create `client/src/store/middleware/authListener.ts`:
  - Use `createListenerMiddleware` from RTK
  - Add listener for 401 errors:
    - When API call fails with 401
    - POST to /api/auth/refresh with credentials: 'include'
    - If refresh succeeds (204), retry original request
    - If refresh fails (401), dispatch logout
  - **IMPORTANT**: This is the ONLY place where refresh logic lives
  - Do NOT duplicate refresh logic in components or RTK Query

- [ ] Add listener to store configuration:
  - Import authListener in `configureStore`
  - Add to middleware array

#### 16.3 Auth Service (Not Redux)

- [ ] Create `client/src/services/authService.ts`:
  - `initiateLogin()` function:
    - Generate PKCE params (state, nonce, code_verifier, code_challenge)
    - Save to sessionStorage
    - Build Auth0 authorize URL
    - `window.location.href = authorizeUrl`
    - **NO Redux dispatch** - this is pure side effect
  - `handleCallback(code, state)` async function:
    - Validate state matches sessionStorage
    - Get code_verifier from sessionStorage
    - POST to /api/auth/callback
    - Clear sessionStorage
    - Return success/error
  - **IMPORTANT**: Keep redirects and OAuth flow logic OUT of Redux

### Acceptance Criteria
- [ ] Auth slice manages user state
- [ ] Listener middleware handles 401 refresh (ONE place only)
- [ ] Auth service handles OAuth flow (outside Redux)
- [ ] No tokens stored in Redux
- [ ] No tokens stored in localStorage
- [ ] All API calls include `credentials: 'include'`

### Testing Checklist
- [ ] Unit test auth slice reducers
- [ ] Unit test async thunks (fetchUserProfile, logout)
- [ ] Test listener middleware catches 401
- [ ] Test authService PKCE generation
- [ ] Test authService state validation

---

## Phase 17 — Protected Routing & UI Updates

### Goals
- Create protected route component
- Add callback page
- Update existing pages for auth
- Load user on app mount

### Tasks

#### 17.1 Callback Page

- [ ] Create `client/src/pages/CallbackPage.tsx`:
  - Read `code` and `state` from URL params
  - Import `authService.handleCallback` (NOT Redux action)
  - Call `handleCallback(code, state)` in useEffect
  - On success:
    - Dispatch `fetchUserProfile()` thunk to load user into Redux
    - Use `navigate('/dashboard')` for redirect
  - On error:
    - Show error message
    - Use `navigate('/')` to redirect home
  - Show loading spinner during exchange
  - **IMPORTANT**: Handle redirect with React Router, not Redux

#### 17.2 Protected Route Component

- [ ] Create `client/src/components/ProtectedRoute.tsx`:
  - Use `useAppSelector(selectIsAuthenticated)`
  - Use `useAppSelector(selectIsLoading)`
  - If loading: show loading spinner
  - If not authenticated: `<Navigate to="/" replace />`
  - If authenticated: render children
  - TypeScript props interface

#### 17.3 App Initialization (Load User on Mount)

- [ ] Update `client/src/App.tsx`:
  - Dispatch `fetchUserProfile()` thunk on mount
  - This checks if user has valid cookies
  - If valid: user state populated
  - If 401: user stays null (not authenticated)
  - **NO AuthProvider needed** - Redux handles state

#### 17.4 Router Updates

- [ ] Update `client/src/router/index.tsx`:
  - Add `/callback` route → CallbackPage (lazy loaded)
  - Wrap `/dashboard` route with ProtectedRoute
  - Ensure Suspense still works
  - Keep `/` as public route

#### 17.5 HomePage Updates

- [ ] Update `client/src/pages/HomePage.tsx`:
  - Use `useAppSelector(selectIsAuthenticated)`
  - Use `useAppSelector(selectUser)`
  - Add login button in header:
    - If authenticated: show "Go to Dashboard" button → navigate to /dashboard
    - If not authenticated: show "Login" button → call `authService.initiateLogin()`
  - **IMPORTANT**: Call authService.initiateLogin(), NOT Redux action
  - Login redirects to Auth0 (side effect, not Redux)

#### 17.6 DashboardPage Updates

- [ ] Update `client/src/pages/DashboardPage.tsx`:
  - Use `useAppSelector(selectUser)`
  - Use `useAppDispatch()`
  - Display user info (name, email) in header
  - Add logout button
  - Logout button: `dispatch(logout())` thunk
  - After logout success, navigate to `/` (handle in component or listener)
  - Show user avatar if `user.picture` available

### Common Pitfalls to Avoid

**❌ DON'T:**
- Put OAuth redirect logic in Redux actions/reducers
- Store tokens in Redux state
- Handle navigation in reducers (use Navigate component or navigate())
- Duplicate refresh logic (ONE listener middleware only)
- Forget `credentials: 'include'` on fetch calls

**✅ DO:**
- Use authService for OAuth flow (outside Redux)
- Store only user profile in Redux
- Handle navigation in components
- Use listener middleware for 401 refresh (centralized)
- Always include credentials on API calls

### Acceptance Criteria
- [ ] Callback page handles OAuth redirect (uses authService)
- [ ] Protected routes check Redux auth state
- [ ] Login button calls authService.initiateLogin()
- [ ] Logout button dispatches Redux thunk
- [ ] User info displays from Redux state
- [ ] App loads user on mount (via Redux thunk)
- [ ] All routes work correctly
- [ ] No Context API used

### Testing Checklist
- [ ] Test /callback with valid code and state
- [ ] Test /callback with invalid state (should error)
- [ ] Test /dashboard redirect when not authenticated
- [ ] Test login flow end-to-end
- [ ] Test logout clears Redux state and cookies
- [ ] Test app mount loads user if cookies valid
- [ ] Test 401 triggers refresh via listener middleware

---

## Phase 18 — Auth0 Configuration

### Goals
- Configure Auth0 application
- Document credentials
- Test Auth0 integration

### Tasks

- [ ] Sign in to Auth0 Dashboard

- [ ] Create new Application:
  - Name: "Dashboard Builder (SPA)"
  - Type: Single Page Application

- [ ] Configure Application Settings:
  - Allowed Callback URLs: `http://localhost:5173/callback`
  - Allowed Logout URLs: `http://localhost:5173/`
  - Allowed Web Origins: `http://localhost:5173`
  - Allowed Origins (CORS): `http://localhost:5173`

- [ ] Configure Advanced Settings → OAuth:
  - OIDC Conformant: ON
  - Grant Types: Authorization Code
  - Refresh Token Rotation: ON

- [ ] Copy credentials:
  - Domain (e.g., `my-tenant.eu.auth0.com`)
  - Client ID

- [ ] Create `server/.env` file:
  - Add all required variables from `.env.example`
  - Paste Auth0 domain and client ID

- [ ] Create `client/.env` file (if needed):
  - Add VITE_AUTH0_DOMAIN
  - Add VITE_AUTH0_CLIENT_ID
  - Add VITE_APP_URL

- [ ] Test Auth0 universal login:
  - Click login button
  - Redirects to Auth0
  - Can see login form
  - Can create test user account

### Acceptance Criteria
- [ ] Auth0 application configured
- [ ] Credentials documented in .env
- [ ] Universal login accessible
- [ ] Test user can be created
- [ ] Callback URLs match exactly

---

## Phase 19 — Integration Testing & Security Audit

### Goals
- Test full authentication flow
- Verify security best practices
- Fix any issues found

### Tasks

#### 19.1 Manual Testing

- [ ] Start both servers (client + backend)
- [ ] Test login flow:
  - Click "Login" on HomePage
  - Redirected to Auth0
  - Enter credentials
  - Redirected to /callback
  - Redirected to /dashboard
  - User info displays

- [ ] Test cookies:
  - Open DevTools → Application → Cookies
  - Verify `at` and `rt` cookies exist
  - Verify HttpOnly flag is set
  - Verify Secure flag (if HTTPS)
  - Verify SameSite is set

- [ ] Test localStorage/sessionStorage:
  - Verify NO tokens in localStorage
  - SessionStorage should be empty after callback

- [ ] Test /api/me endpoint:
  - Call from authenticated state
  - Returns user profile JSON

- [ ] Test token refresh:
  - Wait for access token expiry (or manually clear `at` cookie)
  - Make API call
  - Should auto-refresh and retry
  - New cookies should be set

- [ ] Test logout:
  - Click "Logout" button
  - Cookies cleared
  - Redirected to HomePage
  - /api/me returns 401

- [ ] Test protected routes:
  - Logout
  - Try to access /dashboard directly
  - Should redirect to HomePage

#### 19.2 Security Audit

- [ ] Verify PKCE implementation:
  - Code verifier is 43+ characters
  - Code challenge is SHA-256 hash
  - State parameter used for CSRF

- [ ] Verify cookie security:
  - HttpOnly: true (JavaScript cannot access)
  - Secure: true (production only)
  - SameSite: 'lax' or 'strict'
  - Domain matches app domain

- [ ] Verify CORS configuration:
  - Only allows SPA origin
  - credentials: true enabled
  - No wildcard origins

- [ ] Verify no token exposure:
  - No tokens in localStorage
  - No tokens in sessionStorage (except temp PKCE)
  - No tokens in URL params
  - No tokens in console logs

- [ ] Verify token TTL:
  - Access token: 5-10 min
  - Refresh token: 7 days
  - Rotation enabled

- [ ] Check CSP headers (optional):
  - No unsafe-inline
  - connect-src restricted

#### 19.3 Error Handling

- [ ] Test error cases:
  - Invalid authorization code
  - State mismatch
  - Network errors
  - Backend down
  - Auth0 down
  - Expired refresh token

- [ ] Verify user-friendly error messages
- [ ] Verify app doesn't crash
- [ ] Verify proper redirects on errors

### Acceptance Criteria
- [ ] Full login flow works end-to-end
- [ ] All security checks pass
- [ ] Cookies configured correctly
- [ ] No tokens exposed
- [ ] Error handling robust
- [ ] Manual testing checklist complete

---

## Phase 20 — E2E Tests & Documentation

### Goals
- Add automated E2E tests
- Document authentication system
- Update README

### Tasks

#### 20.1 E2E Tests (Optional - Playwright)

- [ ] Install Playwright:
  ```bash
  cd client
  npm install -D @playwright/test
  ```

- [ ] Create test for login flow:
  - Navigate to HomePage
  - Click "Login" button
  - Fill Auth0 login form (use test credentials)
  - Assert redirected to /dashboard
  - Assert user info visible

- [ ] Create test for protected routes:
  - Navigate to /dashboard without auth
  - Assert redirected to /

- [ ] Create test for logout:
  - Login
  - Click "Logout"
  - Assert redirected to HomePage
  - Assert user info gone

- [ ] Create test for token refresh:
  - Login
  - Wait for token expiry
  - Make API call
  - Assert still authenticated

#### 20.2 Documentation

- [ ] Update main `README.md`:
  - Add "Authentication" section
  - Explain Auth0 setup
  - Link to oauth2-guide.md
  - Document environment variables
  - Add troubleshooting section

- [ ] Create `server/README.md`:
  - Explain backend architecture
  - Document API endpoints
  - Explain cookie handling
  - Provide setup instructions

- [ ] Update `.env.example` files:
  - Add comments for each variable
  - Provide example values
  - Explain where to get Auth0 credentials

- [ ] Document common issues:
  - CORS errors → check origins
  - Cookie not set → check flags
  - 401 errors → check token expiry
  - State mismatch → clear sessionStorage

#### 20.3 Final Checklist

- [ ] All manual tests passing
- [ ] E2E tests passing (if implemented)
- [ ] Documentation complete
- [ ] No TODOs in code
- [ ] No console errors
- [ ] No console warnings
- [ ] Production-ready
- [ ] `.env` files in `.gitignore`
- [ ] Secrets not committed

### Acceptance Criteria
- [ ] E2E tests cover main flows
- [ ] Documentation comprehensive
- [ ] README updated
- [ ] Common issues documented
- [ ] Production-ready checklist complete

---

## Summary

Following these 8 phases (13-20) will result in a production-ready authentication system integrated with your Dashboard Builder application. Each phase builds on the previous one, ensuring a systematic and secure implementation.

**Next Steps After Completion:**
1. Deploy to production environment
2. Configure production Auth0 application
3. Update environment variables for production
4. Enable HTTPS
5. Test in production
6. Monitor error logs
7. Set up alerts for auth failures

**Reference Documents:**
- [oauth2-guide.md](./oauth2-guide.md) - Complete technical guide
- [STEP-BY-STEP.md](./STEP-BY-STEP.md) - Original dashboard implementation phases
