/**
 * HomePage Component
 *
 * Landing page for the dashboard builder application
 * Refactored for clean architecture:
 * - Extracted feature data to constants
 * - Created reusable components (PageHeader, HeroSection, FeatureCard, FooterCTA)
 * - Improved maintainability and DRY principles
 */

import { FEATURES } from "@/constants/features";
import { PageHeader, HeroSection, FeatureCard, FooterCTA } from "@/components/HomePage";

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PageHeader />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <HeroSection />

        {/* Features Grid */}
        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        <FooterCTA />
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
