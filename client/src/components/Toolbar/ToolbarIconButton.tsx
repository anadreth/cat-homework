import { cx } from '@/lib/utils/common';
import { type ReactNode } from 'react';

interface ToolbarIconButtonProps {
  onClick: () => void;
  icon: ReactNode;
  title: string;
  hideOnDesktop?: boolean;
  className?: string;
}

export function ToolbarIconButton({
  onClick,
  icon,
  title,
  hideOnDesktop = false,
  className,
}: ToolbarIconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'rounded p-1.5 text-gray-600 hover:bg-gray-100',
        hideOnDesktop && 'lg:hidden',
        className
      )}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
}
