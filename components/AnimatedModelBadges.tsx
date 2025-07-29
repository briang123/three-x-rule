'use client';

import { motion } from 'framer-motion';
import { ModelSelection } from './ModelGridSelector';
import { ModelInfo } from '@/lib/api-client';
import { useState, useEffect } from 'react';

interface AnimatedModelBadgesProps {
  modelSelections: ModelSelection[];
  models: ModelInfo[];
  onRestore: () => void;
  isVisible: boolean;
  isModelSelectorOpen?: boolean;
}

export default function AnimatedModelBadges({
  modelSelections,
  models,
  onRestore,
  isVisible,
  isModelSelectorOpen = false,
}: AnimatedModelBadgesProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Model badges - show when models are selected */}
      {modelSelections.length > 0 &&
        modelSelections.map((selection, index) => {
          const model = models.find((m) => m.id === selection.modelId);
          return (
            <motion.div
              key={selection.modelId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              className="flex items-center space-x-1 bg-kitchen-accent-blue/10 dark:bg-kitchen-dark-accent-blue/20 border border-kitchen-accent-blue/20 dark:border-kitchen-dark-accent-blue/30 rounded-full px-1.5 py-0.5 text-xs font-medium text-kitchen-accent-blue dark:text-kitchen-dark-accent-blue"
            >
              <span className="font-medium text-xs">{selection.modelId}</span>
              <span className="bg-kitchen-accent-blue/20 dark:bg-kitchen-dark-accent-blue/30 text-kitchen-accent-blue dark:text-kitchen-dark-accent-blue rounded-full px-1 py-0.5 text-xs font-bold">
                {selection.count}
              </span>
            </motion.div>
          );
        })}

      {/* Change Models Button - show when models are selected */}
      {!isModelSelectorOpen && modelSelections.length > 0 && (
        <motion.button
          onClick={onRestore}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: 0.2,
            ease: 'easeOut',
          }}
          title="Change Models"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
