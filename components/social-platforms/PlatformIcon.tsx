'use client';

import React from 'react';

interface PlatformIconProps {
  icon: React.ReactNode;
  gradient: string;
  className?: string;
}

export default function PlatformIcon({
  icon,
  gradient,
  className = 'w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-semibold',
}: PlatformIconProps) {
  return <div className={`bg-gradient-to-r ${gradient} ${className}`}>{icon}</div>;
}
