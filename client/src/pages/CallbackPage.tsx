import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchUserProfile } from "@/store";
import { AppLoader } from "@/components/AppLoader";
import { useAppDispatch } from "@/store/hooks";
import { handleCallback } from "@/lib/auth/service";

export function CallbackPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("[CallbackPage] Processing OAuth callback...");

        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
          throw new Error("Missing authorization code or state");
        }

        await handleCallback(code, state);
        console.log(
          "[CallbackPage] Token exchange successful, fetching user profile..."
        );

        await dispatch(fetchUserProfile()).unwrap();
        console.log(
          "[CallbackPage] Login complete, redirecting to dashboard..."
        );

        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("[CallbackPage] OAuth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [dispatch, navigate, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Authentication Failed
            </h2>
          </div>
          <p className="mb-4 text-center text-sm text-gray-600">{error}</p>
          <p className="text-center text-xs text-gray-500">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 text-center">
          <AppLoader />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Completing Sign In
          </h2>
        </div>
        <p className="text-center text-sm text-gray-600">
          Please wait while we log you in...
        </p>
      </div>
    </div>
  );
}
