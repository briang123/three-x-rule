'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MotionBorderCardProps {
  children: React.ReactNode;
  isBorderFaded: boolean;
  fadedBorderColor?: string;
  activeBorderColor?: string;
  className?: string;
}

export default function MotionBorderCard({
  children,
  isBorderFaded,
  fadedBorderColor = 'border-gray-200 dark:border-kitchen-dark-border',
  activeBorderColor = 'border-2 border-green-500 dark:border-green-400',
  className = 'kitchen-card p-6 flex flex-col overflow-hidden flex-shrink-0 column-container w-full max-w-full transition-all duration-1000 ease-in-out',
}: MotionBorderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`${className} ${isBorderFaded ? fadedBorderColor : activeBorderColor}`}
    >
      {children}
    </motion.div>
  );
}
