/**
 * Application Router
 *
 * Defines all application routes:
 * - / (HomePage): Landing page with login
 * - /callback (CallbackPage): OAuth callback handler
 * - /dashboard (DashboardPage): Protected dashboard builder
 * - * (404): Redirects to home page
 *
 * All lazy-loaded routes share a single Suspense boundary at the router level
 */

import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AppLoader } from "@/components/AppLoader";

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({ default: module.HomePage }))
);

const CallbackPage = lazy(() =>
  import("@/pages/CallbackPage").then((module) => ({
    default: module.CallbackPage,
  }))
);

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);

// Root layout with shared Suspense boundary for all routes
function RootLayout() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Outlet />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/callback",
        element: <CallbackPage />,
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "*",
        element: <HomePage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
