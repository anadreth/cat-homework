/**
 * PageHeader Component
 *
 * Homepage header with logo and CTA button
 */

import { Link } from "react-router-dom";
import { RiLayoutGridLine } from "@remixicon/react";

export function PageHeader() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <RiLayoutGridLine size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Dashboard Builder
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
