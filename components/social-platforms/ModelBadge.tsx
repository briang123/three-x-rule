'use client';

import React from 'react';

interface ModelBadgeProps {
  modelId: string;
  className?: string;
}

export default function ModelBadge({
  modelId,
  className = 'text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full',
}: ModelBadgeProps) {
  return <span className={className}>{modelId || 'Model'}</span>;
}
