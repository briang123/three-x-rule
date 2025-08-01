'use client';

import React from 'react';

interface ErrorIconProps {
  className?: string;
}

export default function ErrorIcon({ className = 'w-5 h-5 text-red-500' }: ErrorIconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
