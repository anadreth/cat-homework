/**
 * ToolbarDivider Component
 *
 * Visual separator for toolbar sections
 */

import { cx } from "@/utils/common";

interface ToolbarDividerProps {
  hideOnMobile?: boolean;
  className?: string;
}

export function ToolbarDivider({ hideOnMobile = false, className }: ToolbarDividerProps) {
  return (
    <div
      className={cx(
        'mx-1 h-6 border-l border-gray-300 sm:mx-2',
        hideOnMobile && 'hidden sm:block',
        className
      )}
      aria-hidden="true"
    />
  );
}
