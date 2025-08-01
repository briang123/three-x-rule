'use client';

import React from 'react';
import ErrorIcon from '../icons/ErrorIcon';

interface ErrorDisplayProps {
  errorMessage: string;
  className?: string;
}

export default function ErrorDisplay({
  errorMessage,
  className = 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4',
}: ErrorDisplayProps) {
  return (
    <div className={className}>
      <div className="flex items-center space-x-2 mb-2">
        <ErrorIcon />
        <span className="text-sm font-medium text-red-700 dark:text-red-300">Error</span>
      </div>
      <p className="text-red-600 dark:text-red-400 text-sm">{errorMessage}</p>
    </div>
  );
}
