/**
 * Auth Slice - Redux Toolkit
 *
 * Manages authentication state (user profile only, NOT tokens)
 * Tokens are stored in HttpOnly cookies on the backend
 *
 * State stored here:
 * ✅ User profile (name, email, picture, etc.)
 * ✅ Loading states
 * ✅ Authentication status
 * ✅ Error messages
 *
 * NOT stored here:
 * ❌ Access tokens (in HttpOnly cookies)
 * ❌ Refresh tokens (in HttpOnly cookies)
 * ❌ PKCE verifier (in sessionStorage temporarily)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { apiClient } from '@/lib/api/client';

// User profile interface (from Auth0 /userinfo)
export interface User {
  sub: string;              // Auth0 user ID (e.g., "auth0|123...")
  email: string;
  email_verified?: boolean;
  name: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Fetch user profile from backend
 * Calls GET /api/auth/me which reads access token from HttpOnly cookie
 */
export const fetchUserProfile = createAsyncThunk<User, void>(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Auth Slice] Fetching user profile...');

      const response = await apiClient.get('/api/auth/me');

      if (!response.ok) {
        // If 401, user is not authenticated (or token expired and refresh failed)
        if (response.status === 401) {
          return rejectWithValue('Not authenticated');
        }
        return rejectWithValue('Failed to fetch user profile');
      }

      const user: User = await response.json();
      console.log('[Auth Slice] User profile fetched:', user.email);

      return user;
    } catch (error) {
      console.error('[Auth Slice] Fetch user profile error:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

/**
 * Logout user
 * Calls POST /api/auth/logout to clear HttpOnly cookies
 */
export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Auth Slice] Logging out...');

      const response = await apiClient.post('/api/auth/logout');

      if (!response.ok) {
        return rejectWithValue('Logout failed');
      }

      console.log('[Auth Slice] Logout successful');
    } catch (error) {
      console.error('[Auth Slice] Logout error:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchUserProfile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Even if logout request fails, clear user state
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

// ============================================================================
// Selectors
// ============================================================================

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// ============================================================================
// Exports
// ============================================================================

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
