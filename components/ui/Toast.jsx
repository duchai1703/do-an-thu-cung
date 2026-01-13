/**
 * Toast Component - Display temporary notification messages
 * Supports multiple types: success, error, warning, info
 */
'use client';

import { useEffect, useState } from 'react';

const TOAST_TYPES = {
  success: {
    bg: 'bg-green-500',
    icon: '✓',
    borderColor: 'border-green-600',
  },
  error: {
    bg: 'bg-red-500',
    icon: '✕',
    borderColor: 'border-red-600',
  },
  warning: {
    bg: 'bg-yellow-500',
    icon: '⚠',
    borderColor: 'border-yellow-600',
  },
  info: {
    bg: 'bg-blue-500',
    icon: 'ℹ',
    borderColor: 'border-blue-600',
  },
};

export default function Toast({ id, message, type = 'info', duration = 5000, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const config = TOAST_TYPES[type] || TOAST_TYPES.info;

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress > 0 ? newProgress : 0;
      });
    }, 50);

    // Auto close timer
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300); // Match animation duration
  };

  return (
    <div
      className={`
        relative w-96 max-w-full
        bg-white rounded-lg shadow-lg border-l-4 ${config.borderColor}
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Main content */}
      <div className="flex items-start p-4">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-8 h-8 rounded-full ${config.bg}
            flex items-center justify-center text-white font-bold text-lg
          `}
        >
          {config.icon}
        </div>

        {/* Message */}
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="
            flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-300 rounded
          "
          aria-label="Đóng thông báo"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div
          className={`h-full ${config.bg} transition-all duration-50 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Toast Container - Container for displaying multiple toasts
 */
export function ToastContainer({ toasts = [], onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
