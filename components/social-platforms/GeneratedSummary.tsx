'use client';

import React from 'react';
import CopyButton from '@/components/CopyButton';
import CheckIcon from '../icons/CheckIcon';

interface GeneratedSummaryProps {
  postCount: number;
  contentType: string;
  fullResponse: string;
  className?: string;
}

export default function GeneratedSummary({
  postCount,
  contentType,
  fullResponse,
  className = 'relative flex items-center justify-between mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg',
}: GeneratedSummaryProps) {
  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <CheckIcon />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Generated {postCount} {contentType}
        </span>
      </div>
      <div className="absolute top-2 right-2 z-10">
        <CopyButton content={fullResponse} />
      </div>
    </div>
  );
}
