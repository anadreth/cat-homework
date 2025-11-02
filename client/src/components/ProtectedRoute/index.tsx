/**
 * ProtectedRoute Component
 *
 * Wrapper for routes that require authentication
 * - Checks if user is authenticated via Redux selector
 * - Re-validates auth on location change to catch stale state
 * - Shows loading state while checking authentication
 * - Redirects to home page if not authenticated
 * - Renders children if authenticated
 */

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectIsLoading, fetchUserProfile } from '@/store';
import { AppLoader } from '@/components/AppLoader';
import { useAppDispatch } from '@/store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  // Re-validate authentication whenever location changes
  // This catches edge cases where:
  // 1. User presses browser back button after logout
  // 2. Redux state is stale
  // 3. Cookies expired while app was idle
  useEffect(() => {
    if (!isLoading) {
      console.log('[ProtectedRoute] Location changed, re-validating auth...');
      dispatch(fetchUserProfile());
    }
  }, [location.pathname, dispatch, isLoading]);

  // Show loader while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <AppLoader />
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return <>{children}</>;
}
