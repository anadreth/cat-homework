import { Link } from "react-router-dom";
import {
  RiLayoutGridLine,
  RiDragMoveLine,
  RiPaintLine,
  RiArrowRightLine,
  RiBarChartBoxLine,
  RiTableLine,
  RiListCheck2,
} from "@remixicon/react";

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
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

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
            A powerful, Retool-style dashboard builder with drag-and-drop
            widgets, real-time updates, and LocalStorage persistence. Start
            building your perfect dashboard in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              Start Building
              <RiArrowRightLine
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <a
              href="https://github.com/anthropics/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
              <RiDragMoveLine size={24} className="text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Drag & Drop
            </h3>
            <p className="text-gray-600">
              Intuitive drag-and-drop interface powered by Gridstack.js. Resize
              and reposition widgets with ease.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3">
              <RiBarChartBoxLine size={24} className="text-purple-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Rich Widgets
            </h3>
            <p className="text-gray-600">
              Multiple widget types: charts, tables, lists, and text. Each with
              customizable properties and styling.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-green-100 p-3">
              <RiPaintLine size={24} className="text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Customizable
            </h3>
            <p className="text-gray-600">
              Edit widget properties in real-time with the inspector panel. See
              changes instantly on the canvas.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-orange-100 p-3">
              <RiTableLine size={24} className="text-orange-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Auto-Save
            </h3>
            <p className="text-gray-600">
              Your dashboards are automatically saved to LocalStorage with
              debounced updates. Never lose your work.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-red-100 p-3">
              <RiListCheck2 size={24} className="text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Undo/Redo
            </h3>
            <p className="text-gray-600">
              Full undo/redo support with keyboard shortcuts. Experiment freely
              knowing you can always go back.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 inline-flex rounded-lg bg-indigo-100 p-3">
              <RiLayoutGridLine size={24} className="text-indigo-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Export/Import
            </h3>
            <p className="text-gray-600">
              Export dashboards as JSON files. Import to share dashboards across
              devices or with your team.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-24 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center shadow-xl sm:p-12">
          <h3 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Ready to build something amazing?
          </h3>
          <p className="mb-8 text-lg text-blue-100">
            Start creating your dashboard in seconds. No signup required.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-transform hover:scale-105"
          >
            Launch Dashboard Builder
            <RiArrowRightLine size={20} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Built with React 19, Redux Toolkit, Tailwind CSS, and Tremor
          </p>
        </div>
      </footer>
    </div>
  );
}
