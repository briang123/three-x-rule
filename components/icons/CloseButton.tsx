'use client';

import React from 'react';

interface CloseButtonProps {
  onClose: () => void;
  title?: string;
  className?: string;
}

export default function CloseButton({ 
  onClose, 
  title = "Close social posts",
  className = "p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-red-500 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600"
}: CloseButtonProps) {
  return (
    <button
      onClick={onClose}
      className={className}
      title={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
} 