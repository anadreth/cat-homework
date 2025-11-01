1) Create & configure your Auth0 application

Sign in to Auth0 Dashboard → Applications → Create Application

Name: “Dashboard Builder (SPA)”

Type: Single Page Web Application

In the app settings, set:

Allowed Callback URLs (where Auth0 redirects with the code):

Dev: http://localhost:5173/callback


Allowed Logout URLs:

Dev: http://localhost:5173/


Allowed Web Origins (XHR from SPA to Auth0, if used):

http://localhost:5173, https://app.example.com

Allowed Origins (CORS):

same as above.

Application URIs for your backend (no redirect needed here—backend talks server-to-server).

Scroll to Advanced Settings → OAuth:

Ensure OIDC Conformant is on (usually default).

Grant Types: Authorization Code (PKCE is implicit from SPA usage).

(Optional but recommended) Refresh Token Rotation: enable in APIs / Token Settings or Application settings (depends on tenant UI).

Copy these to your .env:

AUTH0_DOMAIN (e.g., my-tenant.eu.auth0.com)

AUTH0_CLIENT_ID

(No client secret needed for SPA PKCE exchange; your backend will still call /oauth/token without a secret using PKCE code_verifier.)

Endpoints (usually derived from domain): https://{AUTH0_DOMAIN}/authorize, /oauth/token, /userinfo, /v2/logout.

Connections/MFA/Branding: optional now, can enable later.

2) Define your app’s security model

Flow: Authorization Code + PKCE.

The SPA never stores tokens; tokens live in HttpOnly, Secure, SameSite cookies set by your backend after exchanging the code.

Access Token TTL short (5–10 min); Refresh Token rotation on.

Scopes to start: openid profile email (add API scopes later).

3) Express backend (token exchange + cookies)
3.1 Env vars (.env)
PORT=3000
AUTH0_DOMAIN=your-tenant.eu.auth0.com
AUTH0_CLIENT_ID=xxxxxxxx
# no secret for SPA+PKCE code exchange
APP_URL_DEV=http://localhost:5173
COOKIE_DOMAIN_DEV=localhost
NODE_ENV=development

3.2 Routes your backend must expose

POST /api/auth/callback
Input: { code, verifier, redirectUri } from SPA callback page.
Action: POST to https://AUTH0_DOMAIN/oauth/token with:

grant_type=authorization_code

client_id=AUTH0_CLIENT_ID

code, code_verifier, redirect_uri
Result: set HttpOnly cookies:

at (access token) — short TTL

rt (refresh token) — longer TTL; rotate when new RT returned.
Return 204.

POST /api/auth/refresh
Reads rt cookie, POST to /oauth/token:

grant_type=refresh_token

client_id=AUTH0_CLIENT_ID

refresh_token=<cookie>
Rotate cookies; return 204.

POST /api/auth/logout
Clear at/rt cookies; optionally redirect user to
https://AUTH0_DOMAIN/v2/logout?returnTo=<APP_URL>.

GET /api/me
Read at cookie; call https://AUTH0_DOMAIN/userinfo with Authorization: Bearer <at>; return JSON to SPA.

3.3 Cookie settings (important)

httpOnly: true

secure: true (requires HTTPS in prod)

sameSite: "lax" (or "strict" if your flows allow)

domain:  localhost (dev)

path: "/"

3.4 CORS

Allow Origin: http://localhost:5173 (dev) 

credentials: true so browser sends cookies.

4) React app (SPA) responsibilities
4.1 Start login (button)

Generate:

state (random)

nonce (random)

PKCE code_verifier → derive code_challenge(S256)

Store state, nonce, code_verifier in sessionStorage.

Redirect to:

https://AUTH0_DOMAIN/authorize?
response_type=code&
client_id=AUTH0_CLIENT_ID&
redirect_uri=<APP_URL>/callback&
scope=openid%20profile%20email&
state=<state>&
nonce=<nonce>&
code_challenge=<challenge>&
code_challenge_method=S256

4.2 Callback route /callback

Read code & state from URL.

Validate state against sessionStorage.

Read code_verifier from sessionStorage.

POST to your backend /api/auth/callback with { code, verifier, redirectUri }.

On 204, redirect user to app root or last page.

4.3 Using the session in SPA

All API calls go to your backend with fetch(..., { credentials: "include" }).

If a call returns 401, immediately POST /api/auth/refresh once, then retry the call.

4.4 Logout

POST /api/auth/logout (backend clears cookies).

Optionally, redirect to Auth0’s logout endpoint then back to your app.

5) Dev URLs (be explicit)

Dev

SPA: http://localhost:5173

API: http://localhost:3000

Callback: http://localhost:5173/callback

Logout returnTo: http://localhost:5173/

Make sure all Auth0 settings (callback/logout/web origins/CORS) include these exact URLs.

6) Security hardening checklist

✅ Authorization Code + PKCE (never Implicit).

✅ HttpOnly, Secure, SameSite cookies for tokens.

✅ Short AT TTL (e.g., 5–10 min) + Refresh Token Rotation.

✅ Validate state (CSRF protection) and use nonce for OIDC ID token checks (server-side if you validate ID tokens).

✅ CORS: only your SPA origin; credentials: true.

✅ CSP on SPA: no unsafe-inline, lock down connect-src to your API and Auth0.

✅ No tokens in localStorage/sessionStorage (only the temporary code_verifier/state/nonce during the redirect roundtrip).

✅ On logout, optionally call Auth0 /v2/logout to end the IdP session as well.

7) Optional: calling your own APIs (RS)

If you have a custom API (Resource Server):

Create an Auth0 API (Dashboard → APIs) → audience = https://api.example.com.

Request that scope/audience during /authorize.

Your backend (as a BFF) can still use the at to call your API, or you can mint a separate AT for it via refresh flow.

8) Testing plan (manual + automated)

Manual

Login → Auth0 screen → back to /callback → home.

Open DevTools → confirm no tokens in localStorage; cookies exist (HttpOnly).

Call /api/me → returns profile.

Wait AT expiry → API returns 401 → frontend calls /api/auth/refresh → next call succeeds.

Close browser; reopen → still logged in (if cookies persistent).

Logout → cookies cleared; /api/me returns 401; Auth0 session (if kept) logs back instantly when clicking login.

Automated

Unit: small helpers (PKCE utils), cookie helpers.

Integration (RTL): callback page validates state, calls backend, handles errors.

E2E (Playwright): full login flow with Auth0’s universal login (use Auth0 test tenant credentials), /me works, refresh path exercised, logout returns to home.

9) Common pitfalls (and fixes)

CORS 401/blocked: missing credentials: "include" on SPA fetch or API doesn’t allow credentials/Origin.

Cookie not set: missing Secure with HTTPS in prod, wrong cookie domain, or path issues.

Auth0 “Mismatch redirect_uri”: callback URL in app doesn’t exactly match Auth0 settings.

Endless 302 loop: not validating state, or backend failing token exchange and SPA retrying login blindly.

Refresh not rotating: not storing the new refresh_token cookie on refresh response.

10) Minimal deliverables checklist

 Auth0 application configured (callback/logout/origins set).

 Backend routes: /api/auth/callback, /api/auth/refresh, /api/auth/logout, /api/me.

 Cookies set with proper flags and domains.

 SPA login button builds PKCE + state/nonce and redirects to /authorize.

 SPA callback posts code + verifier to backend; handles success/failure.

 API helper with credentials: "include" and one-shot refresh retry on 401.

 Logout clears cookies and (optionally) ends Auth0 session.

 CSP & CORS configured; no tokens in web storage.

 Manual & E2E tests pass.