/**
 * HeroSection Component
 *
 * Main hero section with title, description, and CTA buttons
 */

import { RiArrowRightLine } from "@remixicon/react";

export function HeroSection() {
  return (
    <div className="text-center">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
        </span>
        Built with React 19 + Redux Toolkit
      </div>

      {/* Hero Title */}
      <h2 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
        Build Beautiful
        <br />
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboards
        </span>
      </h2>

      {/* Hero Description */}
      <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 sm:text-xl">
        A powerful, Retool-style dashboard builder with drag-and-drop widgets,
        real-time updates, and LocalStorage persistence. Start building your
        perfect dashboard in seconds.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="cursor-pointer group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          Start Building
          <RiArrowRightLine
            size={20}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
        <a
          href="https://github.com/anadreth/cat-homework"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}
