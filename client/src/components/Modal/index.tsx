/**
 * Modal Component
 *
 * Generic reusable modal dialog
 * Features:
 * - Click outside to close
 * - Escape key to close
 * - Backdrop with overlay
 * - Centered content
 * - Custom title and body
 */

import { useEffect, useRef } from 'react';
import { RiCloseLine } from '@remixicon/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[2000] bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-[2001] flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          className={`w-full ${MAX_WIDTH_CLASSES[maxWidth]} rounded-lg bg-white shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close dialog"
            >
              <RiCloseLine size={24} />
            </button>
          </div>

          {/* Body */}
          <div>{children}</div>
        </div>
      </div>
    </>
  );
}
