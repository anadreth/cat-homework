import {
  AUTH_CODE_VERIFIER_KEY,
  AUTH_NONCE_KEY,
  AUTH_STATE_KEY,
} from "@/constants/auth0";

export interface AuthParams {
  state: string;
  nonce: string;
  codeVerifier: string;
}

export function saveAuthParams(
  state: string,
  nonce: string,
  codeVerifier: string
): void {
  sessionStorage.setItem(AUTH_STATE_KEY, state);
  sessionStorage.setItem(AUTH_NONCE_KEY, nonce);
  sessionStorage.setItem(AUTH_CODE_VERIFIER_KEY, codeVerifier);

  console.log("[Auth Storage] Saved auth params to sessionStorage");
}

export function getAuthParams(): AuthParams | null {
  const state = sessionStorage.getItem(AUTH_STATE_KEY);
  const nonce = sessionStorage.getItem(AUTH_NONCE_KEY);
  const codeVerifier = sessionStorage.getItem(AUTH_CODE_VERIFIER_KEY);

  if (!state || !nonce || !codeVerifier) {
    console.warn("[Auth Storage] Missing auth params in sessionStorage");
    return null;
  }

  return { state, nonce, codeVerifier };
}

export function clearAuthParams(): void {
  sessionStorage.removeItem(AUTH_STATE_KEY);
  sessionStorage.removeItem(AUTH_NONCE_KEY);
  sessionStorage.removeItem(AUTH_CODE_VERIFIER_KEY);

  console.log("[Auth Storage] Cleared auth params from sessionStorage");
}

export function validateState(receivedState: string): boolean {
  const storedState = sessionStorage.getItem(AUTH_STATE_KEY);

  if (!storedState) {
    console.error("[Auth Storage] No stored state found");
    return false;
  }

  if (receivedState !== storedState) {
    console.error("[Auth Storage] State mismatch - possible CSRF attack");
    return false;
  }

  console.log("[Auth Storage] State validated successfully");
  return true;
}
