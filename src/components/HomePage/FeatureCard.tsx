/**
 * FeatureCard Component
 *
 * Reusable card component for displaying feature information
 */

import type { Feature } from "@/constants/features";

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`mb-4 inline-flex rounded-lg ${feature.iconBgColor} p-3`}>
        <Icon size={24} className={feature.iconColor} />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        {feature.title}
      </h3>
      <p className="text-gray-600">{feature.description}</p>
    </div>
  );
}
