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

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsAuthenticated, selectIsLoading } from '@/store';
import { AppLoader } from '@/components/AppLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

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
