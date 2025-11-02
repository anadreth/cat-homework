/**
 * Auth Listener Middleware
 *
 * Handles automatic token refresh on 401 errors
 *
 * IMPORTANT:
 * - This is the SINGLE SOURCE OF TRUTH for refresh logic
 * - DO NOT duplicate this logic anywhere else
 * - The apiClient (Phase 15) already handles 401 retry
 * - This listener provides additional Redux-level handling
 *
 * Note: The actual refresh logic is in /client/src/lib/api/client.ts
 * This middleware just listens for auth failures and can trigger logout
 */

import { createListenerMiddleware } from '@reduxjs/toolkit';
import { fetchUserProfile, logout } from '../slices/authSlice';

// Create listener middleware instance
export const authListenerMiddleware = createListenerMiddleware();

/**
 * Listen for fetchUserProfile rejections
 * If user profile fetch fails with 401, it means refresh also failed
 * In this case, we should ensure user is logged out
 */
authListenerMiddleware.startListening({
  actionCreator: fetchUserProfile.rejected,
  effect: async (action, _listenerApi) => {
    // If rejection was due to 401 (not authenticated)
    if (action.payload === 'Not authenticated') {
      console.log('[Auth Listener] User not authenticated, ensuring logout state');

      // User state is already cleared by the reducer
      // This is just for logging/tracking purposes
      // The logout action would clear cookies, but they're already invalid
    }
  },
});

/**
 * Listen for logout fulfillment
 * Can be used for cleanup, navigation, or analytics
 */
authListenerMiddleware.startListening({
  actionCreator: logout.fulfilled,
  effect: async () => {
    console.log('[Auth Listener] Logout completed');

    // Optional: Clear any additional app state here
    // Optional: Track analytics event
    // Optional: Navigate to home page (though this should be done in component)
  },
});

// Note: The actual 401 auto-refresh logic is handled by apiClient
// See: /client/src/lib/api/client.ts
// This keeps the refresh logic centralized and prevents duplication
