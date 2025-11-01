/**
 * AppLoader Component
 *
 * Beautiful full-screen loader displayed while the app is loading
 * Uses Tailwind CSS custom animations defined in index.css
 */

export function AppLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="h-full w-full [animation:var(--animate-grid-flow)]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Loader content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated logo/icon */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 [animation:var(--animate-spin-slow)]">
            <div className="h-24 w-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500" />
          </div>

          {/* Inner pulsing circle */}
          <div className="flex h-24 w-24 items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg [animation:var(--animate-pulse-slow)]" />
          </div>

          {/* Grid icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Builder</h2>
          <p className="text-sm text-gray-600">Loading your workspace...</p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-purple-500"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
