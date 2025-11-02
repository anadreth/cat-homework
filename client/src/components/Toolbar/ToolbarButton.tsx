/**
 * ToolbarButton Component
 *
 * Reusable button for toolbar actions
 * Supports variants, icons, disabled state, and responsive behavior
 */

import { cx } from '@/lib/utils/common';
import { type ReactNode } from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label?: string;
  title: string;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  className?: string;
}

export function ToolbarButton({
  onClick,
  icon,
  label,
  title,
  disabled = false,
  variant = 'default',
  hideOnMobile = false,
  hideOnDesktop = false,
  className,
}: ToolbarButtonProps) {
  const baseStyles = 'flex items-center gap-1.5 rounded border px-2 py-1.5 text-sm font-medium transition-colors';

  const variantStyles = {
    default: 'border-gray-300 text-gray-700 hover:bg-gray-50',
    primary: 'border-blue-500 bg-blue-50 text-blue-700',
    danger: 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-red-600',
  };

  const disabledStyles = 'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

  const responsiveStyles = hideOnMobile
    ? 'hidden sm:flex'
    : hideOnDesktop
    ? 'flex sm:hidden'
    : 'flex';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        baseStyles,
        variantStyles[variant],
        disabledStyles,
        responsiveStyles,
        className
      )}
      title={title}
      aria-label={title}
    >
      {icon}
      {label && <span className="hidden lg:inline">{label}</span>}
    </button>
  );
}
