import { Link } from "react-router-dom";
import { RiArrowRightLine } from "@remixicon/react";

export function FooterCTA() {
  return (
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
  );
}
