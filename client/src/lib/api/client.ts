/**
 * API Client with Auto-Refresh
 *
 * Centralized API client for making authenticated requests to backend
 * IMPORTANT: Always includes credentials to send HttpOnly cookies
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Make an authenticated GET request
 * Automatically retries once with token refresh on 401
 *
 * @param path - API path (e.g., '/api/auth/me')
 * @returns Response object
 */
export async function apiGet(path: string): Promise<Response> {
  return apiRequest(path, { method: 'GET' });
}

/**
 * Make an authenticated POST request
 * Automatically retries once with token refresh on 401
 *
 * @param path - API path (e.g., '/api/auth/callback')
 * @param body - Request body (will be JSON stringified)
 * @returns Response object
 */
export async function apiPost(
  path: string,
  body?: unknown
): Promise<Response> {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return apiRequest(path, options);
}

/**
 * Generic API request with auto-refresh on 401
 * CRITICAL: Always includes credentials: 'include' to send cookies
 *
 * @param path - API path
 * @param options - Fetch options
 * @returns Response object
 */
async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;

  // First attempt with credentials
  let response = await fetch(url, {
    ...options,
    credentials: 'include', // CRITICAL: Send cookies
  });

  // If 401, try to refresh token once
  if (response.status === 401) {
    console.log('[API Client] 401 detected, attempting token refresh...');

    // Attempt to refresh token
    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // CRITICAL: Send refresh token cookie
    });

    if (refreshResponse.ok) {
      console.log('[API Client] Token refresh successful, retrying request...');

      // Retry original request with new token
      response = await fetch(url, {
        ...options,
        credentials: 'include',
      });
    } else {
      console.error('[API Client] Token refresh failed');
      // Return the 401 response (will trigger logout in Redux)
      return response;
    }
  }

  return response;
}

/**
 * API Client object with convenient methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get: apiGet,

  /**
   * POST request
   */
  post: apiPost,

  /**
   * Base URL for the API
   */
  baseUrl: API_BASE_URL,
};
