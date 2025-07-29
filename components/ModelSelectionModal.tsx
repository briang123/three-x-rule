'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelInfo } from '@/lib/api-client';
import { ModelSelection } from './ModelGridSelector';

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelSelectionsChange: (selections: ModelSelection[]) => void;
  initialSelections?: ModelSelection[];
  disabled?: boolean;
}

export default function ModelSelectionModal({
  isOpen,
  onClose,
  onModelSelectionsChange,
  initialSelections = [],
  disabled = false,
}: ModelSelectionModalProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<ModelSelection[]>(initialSelections);
  const modalRef = useRef<HTMLDivElement>(null);

  // Update selectedModels when initialSelections prop changes
  useEffect(() => {
    setSelectedModels(initialSelections);
  }, [initialSelections]);

  // Fetch models when modal opens
  useEffect(() => {
    if (isOpen && models.length === 0) {
      const fetchModels = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/chat');
          const data = await response.json();

          if (data.success) {
            setModels(data.data.models);
          } else {
            setError(data.error || 'Failed to fetch models');
          }
        } catch (err) {
          setError('Failed to fetch models');
          console.error('Error fetching models:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchModels();
    }
  }, [isOpen, models.length]);

  // Call onModelSelectionsChange whenever selectedModels changes
  const prevSelectedModelsRef = useRef<ModelSelection[]>(initialSelections);
  useEffect(() => {
    const hasChanged =
      JSON.stringify(prevSelectedModelsRef.current) !== JSON.stringify(selectedModels);
    if (hasChanged) {
      prevSelectedModelsRef.current = selectedModels;
      onModelSelectionsChange(selectedModels);
    }
  }, [selectedModels, onModelSelectionsChange]);

  // Handle click outside modal to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleModelToggle = (modelId: string) => {
    if (disabled) return;

    setSelectedModels((prev) => {
      const existing = prev.find((selection) => selection.modelId === modelId);
      if (existing) {
        // Remove if already selected
        const filtered = prev.filter((selection) => selection.modelId !== modelId);
        return filtered;
      } else {
        // Add with default count of 1
        const newSelection = { modelId, count: 1 };
        const updated = [...prev, newSelection];
        return updated;
      }
    });
  };

  const handleCountChange = (modelId: string, count: number) => {
    if (disabled) return;

    setSelectedModels((prev) => {
      const updated = prev.map((selection) =>
        selection.modelId === modelId ? { ...selection, count: Math.max(1, count) } : selection,
      );
      return updated;
    });
  };

  const isModelSelected = (modelId: string) => {
    return selectedModels.some((selection) => selection.modelId === modelId);
  };

  const getModelCount = (modelId: string) => {
    const selection = selectedModels.find((s) => s.modelId === modelId);
    return selection?.count || 1;
  };

  const totalModels = selectedModels.length;
  const totalResponses = selectedModels.reduce((sum, s) => sum + s.count, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className="bg-white dark:bg-kitchen-dark-surface rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select AI Models
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Choose models and set response variations
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">Loading models...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 text-lg font-semibold mb-2">
                    Error Loading Models
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{error}</div>
                </div>
              ) : (
                <>
                  {/* Model Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {models.map((model) => (
                      <motion.div
                        key={model.id}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isModelSelected(model.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-kitchen-dark-surface hover:border-blue-300 dark:hover:border-blue-600'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleModelToggle(model.id)}
                        whileHover={!disabled ? { scale: 1.02 } : {}}
                        whileTap={!disabled ? { scale: 0.98 } : {}}
                      >
                        {/* Selection indicator */}
                        {isModelSelected(model.id) && (
                          <motion.div
                            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        )}

                        {/* Model info */}
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {model.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {model.description}
                          </p>

                          {/* Counter input */}
                          <div className="h-8 flex items-center justify-center">
                            {isModelSelected(model.id) ? (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-center space-x-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() =>
                                    handleCountChange(model.id, getModelCount(model.id) - 1)
                                  }
                                  className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                  disabled={disabled}
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M20 12H4"
                                    />
                                  </svg>
                                </button>
                                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[2rem]">
                                  {getModelCount(model.id)}
                                </span>
                                <button
                                  onClick={() =>
                                    handleCountChange(model.id, getModelCount(model.id) + 1)
                                  }
                                  className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                  disabled={disabled}
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                </button>
                              </motion.div>
                            ) : (
                              <div className="h-6" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    {totalModels > 0 ? (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Selected Models ({totalResponses} total responses)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedModels.map((selection) => {
                            const model = models.find((m) => m.id === selection.modelId);
                            return (
                              <span
                                key={selection.modelId}
                                className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-sm"
                              >
                                <span>{model?.name}</span>
                                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                  {selection.count}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <span className="text-sm">
                          Select at least one model to start generating content
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {totalModels > 0
                  ? `${totalModels} model${totalModels !== 1 ? 's' : ''} selected`
                  : 'No models selected'}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  disabled={totalModels === 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
