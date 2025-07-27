'use client';

import React from 'react';
import Aurora from './Aurora';

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
  colorStops?: [string, string, string];
  speed?: number;
  blend?: number;
  amplitude?: number;
}

export default function AuroraBackground({
  children,
  className = '',
  colorStops = ['#0F766E', '#BE185D', '#3B82F6'],
  speed = 1.0,
  blend = 0.5,
  amplitude = 1.0,
}: AuroraBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* WebGL Aurora Background */}
      <Aurora colorStops={colorStops} amplitude={amplitude} blend={blend} speed={speed} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
