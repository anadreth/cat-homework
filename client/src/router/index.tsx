/**
 * Application Router
 *
 * Defines all application routes:
 * - / (HomePage): Landing page with login
 * - /callback (CallbackPage): OAuth callback handler
 * - /dashboard (DashboardPage): Protected dashboard builder
 * - * (404): Redirects to home page
 */

import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLoader } from "@/components/AppLoader";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({ default: module.HomePage }))
);

const CallbackPage = lazy(() =>
  import("@/pages/CallbackPage").then((module) => ({ default: module.CallbackPage }))
);

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<AppLoader />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: "/callback",
    element: (
      <Suspense fallback={<AppLoader />}>
        <CallbackPage />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<AppLoader />}>
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<AppLoader />}>
        <HomePage />
      </Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
