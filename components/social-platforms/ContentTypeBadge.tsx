'use client';

import React from 'react';

interface ContentTypeBadgeProps {
  contentType: string;
  gradient: string;
  className?: string;
}

export default function ContentTypeBadge({
  contentType,
  gradient,
  className = 'text-xs font-medium text-white px-2 py-1 rounded-full',
}: ContentTypeBadgeProps) {
  return <span className={`bg-gradient-to-r ${gradient} ${className}`}>{contentType}</span>;
}
