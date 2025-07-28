'use client';

import { motion } from 'framer-motion';
import { ModelSelection } from './ModelGridSelector';
import { ModelInfo } from '@/lib/api-client';

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
      {/* Model badges - only show if models are selected */}
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
              className="flex items-center space-x-1 bg-kitchen-accent-blue/10 dark:bg-kitchen-dark-accent-blue/20 text-kitchen-accent-blue dark:text-kitchen-dark-accent-blue px-2 py-1 rounded-full text-xs"
            >
              <span className="font-medium">{model?.name || selection.modelId}</span>
              <span className="bg-kitchen-accent-blue dark:bg-kitchen-dark-accent-blue text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {selection.count}
              </span>
            </motion.div>
          );
        })}

      {/* Restore button - only show when model selector is closed AND models are selected */}
      {!isModelSelectorOpen && modelSelections.length > 0 && (
        <motion.button
          type="button"
          onClick={onRestore}
          className="flex items-center justify-center w-6 h-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-full text-xs transition-colors duration-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: modelSelections.length * 0.1 + 0.1,
            ease: 'easeOut',
          }}
          title="Reopen AI selection"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
