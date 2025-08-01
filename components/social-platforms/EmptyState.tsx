'use client';

import React from 'react';
import ChatBubbleIcon from './ChatBubbleIcon';

interface EmptyStateProps {
  message?: string;
  className?: string;
}

export default function EmptyState({
  message = 'Social posts will appear here.',
  className = 'text-center text-gray-500 py-8',
}: EmptyStateProps) {
  return (
    <div className={className}>
      <ChatBubbleIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>{message}</p>
    </div>
  );
}
