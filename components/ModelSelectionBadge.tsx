'use client';

import { motion } from 'framer-motion';
import { ModelSelection } from './ModelGridSelector';

interface ModelSelectionBadgeProps {
  modelSelections: ModelSelection[];
  onClick: () => void;
  disabled?: boolean;
  isUsingDefaultModel?: boolean;
}

export default function ModelSelectionBadge({
  modelSelections,
  onClick,
  disabled = false,
  isUsingDefaultModel = false,
}: ModelSelectionBadgeProps) {
  // Hide the badge if using default model
  if (isUsingDefaultModel) {
    return null;
  }

  const totalModels = modelSelections.length;
  const totalResponses = modelSelections.reduce((sum, selection) => sum + selection.count, 0);

  const getBadgeText = () => {
    if (totalModels === 0) {
      return 'Select Models';
    }
    return `Models: ${totalModels}, Responses: ${totalResponses}`;
  };

  const getBadgeColor = () => {
    if (totalModels === 0) {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
    return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800';
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${getBadgeColor()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      title={totalModels === 0 ? 'Click to select AI models' : 'Click to change model selection'}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      <span>{getBadgeText()}</span>
    </motion.button>
  );
}
