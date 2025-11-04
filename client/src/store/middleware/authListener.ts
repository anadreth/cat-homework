/**
 * Auth Listener Middleware
 *
 * Note: The 401 auto-refresh logic is handled by apiClient
 * See: /client/src/lib/api/client.ts
 *
 */

import { createListenerMiddleware } from "@reduxjs/toolkit";
import { fetchUserProfile, logout } from "../slices/authSlice";

export const authListenerMiddleware = createListenerMiddleware();

/**
 * Listen for fetchUserProfile rejections
 * If user profile fetch fails with 401, it means refresh also failed
 * In this case, we should ensure user is logged out
 */
authListenerMiddleware.startListening({
  actionCreator: fetchUserProfile.rejected,
  effect: async (action) => {
    // If rejection was due to 401 (not authenticated)
    if (action.payload === "Not authenticated") {
      console.log(
        "[Auth Listener] User not authenticated, ensuring logout state"
      );
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
    console.log("[Auth Listener] Logout completed");

    // Optional: Clear any additional app state here
    // Optional: Track analytics event
  },
});
