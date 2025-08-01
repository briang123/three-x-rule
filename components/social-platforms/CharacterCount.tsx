'use client';

import React from 'react';

interface CharacterCountProps {
  count: number;
  className?: string;
}

export default function CharacterCount({
  count,
  className = 'text-xs text-gray-400 dark:text-gray-500 ml-2',
}: CharacterCountProps) {
  if (count <= 0) return null;

  return <span className={className}>{count} characters</span>;
}
