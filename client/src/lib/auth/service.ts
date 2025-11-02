import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
} from "@/lib/auth/pkce";
import {
  saveAuthParams,
  getAuthParams,
  clearAuthParams,
  validateState,
} from "@/lib/auth/storage";
import { buildAuthorizeUrl } from "@/lib/auth/auth0";
import { apiClient } from "@/lib/api/client";
import { APP_URL } from "@/constants/auth0";

export function initiateLogin(): void {
  console.log("[Auth Service] Initiating login flow...");

  // Generate PKCE parameters
  const state = generateState();
  const nonce = generateNonce();
  const codeVerifier = generateCodeVerifier();

  // Generate code_challenge from verifier
  generateCodeChallenge(codeVerifier).then((codeChallenge) => {
    // Save to sessionStorage
    saveAuthParams(state, nonce, codeVerifier);

    // Build Auth0 URL
    const authorizeUrl = buildAuthorizeUrl(state, nonce, codeChallenge);

    console.log("[Auth Service] Redirecting to Auth0...");

    // Redirect to Auth0 (side effect, not Redux)
    window.location.href = authorizeUrl;
  });
}

export async function handleCallback(
  code: string,
  state: string
): Promise<{ success: boolean; error?: string }> {
  console.log("[Auth Service] Handling OAuth callback...");

  try {
    if (!validateState(state)) {
      return {
        success: false,
        error: "State mismatch - possible CSRF attack",
      };
    }

    const authParams = getAuthParams();
    if (!authParams) {
      return {
        success: false,
        error: "Missing auth params in sessionStorage",
      };
    }

    const response = await apiClient.post("/api/auth/callback", {
      code,
      verifier: authParams.codeVerifier,
      redirectUri: `${APP_URL}/callback`,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Auth Service] Token exchange failed:", error);
      return {
        success: false,
        error: error.message || "Token exchange failed",
      };
    }

    clearAuthParams();

    console.log("[Auth Service] OAuth callback handled successfully");

    return { success: true };
  } catch (error) {
    console.error("[Auth Service] Callback error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
