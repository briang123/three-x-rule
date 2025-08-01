'use client';

import React from 'react';

interface PostNumberBadgeProps {
  contentType: string;
  postNumber: number;
  className?: string;
}

export default function PostNumberBadge({
  contentType,
  postNumber,
  className = 'text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-kitchen-dark-surface-light px-2 py-1 rounded',
}: PostNumberBadgeProps) {
  return (
    <span className={className}>
      {contentType} {postNumber}
    </span>
  );
}
