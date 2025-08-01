'use client';

import React from 'react';
import { TypingIndicator } from '@/components/TypingIndicator';

interface GeneratingIndicatorProps {
  message?: string;
  className?: string;
}

export default function GeneratingIndicator({
  message = 'Generating social posts...',
  className = 'text-center text-blue-600 py-4',
}: GeneratingIndicatorProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center space-x-2">
        <TypingIndicator />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
