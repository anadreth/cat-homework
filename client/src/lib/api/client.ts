import { API_BASE_URL } from "@/constants/api";

export async function apiGet(path: string): Promise<Response> {
  return apiRequest(path, { method: "GET" });
}

export async function apiPost(path: string, body?: unknown): Promise<Response> {
  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return apiRequest(path, options);
}

async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;

  // First attempt with credentials
  let response = await fetch(url, {
    ...options,
    credentials: "include", // CRITICAL: Send cookies
  });

  // If 401, try to refresh token once
  if (response.status === 401) {
    console.log("[API Client] 401 detected, attempting token refresh...");

    // Attempt to refresh token
    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // CRITICAL: Send refresh token cookie
    });

    if (refreshResponse.ok) {
      console.log("[API Client] Token refresh successful, retrying request...");

      // Retry original request with new token
      response = await fetch(url, {
        ...options,
        credentials: "include",
      });
    } else {
      console.error("[API Client] Token refresh failed");
      return response;
    }
  }

  return response;
}

export const apiClient = {
  get: apiGet,
  post: apiPost,
  baseUrl: API_BASE_URL,
};
