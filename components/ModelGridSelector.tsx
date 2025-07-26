'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ModelInfo } from '@/lib/api-client';

export interface ModelSelection {
  modelId: string;
  count: number;
}

interface ModelGridSelectorProps {
  onModelSelectionsChange: (selections: ModelSelection[]) => void;
  disabled?: boolean;
  initialSelections?: ModelSelection[];
}

export default function ModelGridSelector({
  onModelSelectionsChange,
  disabled = false,
  initialSelections = [],
}: ModelGridSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<ModelSelection[]>(initialSelections);

  // Update selectedModels when initialSelections prop changes
  useEffect(() => {
    setSelectedModels(initialSelections);
  }, [initialSelections]);

  useEffect(() => {
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
  }, []);

  // Call onModelSelectionsChange whenever selectedModels changes, but only if there's an actual change
  const prevSelectedModelsRef = useRef<ModelSelection[]>(initialSelections);
  useEffect(() => {
    // Only call onModelSelectionsChange if the selections have actually changed
    const hasChanged =
      JSON.stringify(prevSelectedModelsRef.current) !== JSON.stringify(selectedModels);
    if (hasChanged) {
      prevSelectedModelsRef.current = selectedModels;
      onModelSelectionsChange(selectedModels);
    }
  }, [selectedModels, onModelSelectionsChange]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-6 h-6 border-2 border-kitchen-accent-blue dark:border-kitchen-dark-accent-blue border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-kitchen-text dark:text-kitchen-dark-text">Loading models...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-center">
          <div className="text-lg font-semibold mb-2">Error Loading Models</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  // Create a 3x3 grid, filling with available models and empty slots
  const gridItems = [];
  for (let i = 0; i < 9; i++) {
    const model = models[i];
    if (model) {
      gridItems.push(model);
    } else {
      gridItems.push(null); // Empty slot
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-kitchen-text dark:text-kitchen-dark-text mb-2">
          Select AI Models
        </h2>
        <p className="text-kitchen-text-light dark:text-kitchen-dark-text-light">
          Choose the models you want to compare and set how many columns to generate for each
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {gridItems.map((model, index) => (
          <motion.div
            key={model?.id || `empty-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`relative ${model ? 'cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
          >
            {model ? (
              <div
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 h-32 w-full flex flex-col ${
                  isModelSelected(model.id)
                    ? 'border-kitchen-accent-blue dark:border-kitchen-dark-accent-blue bg-kitchen-accent-blue/5 dark:bg-kitchen-dark-accent-blue/10'
                    : 'border-kitchen-light-gray dark:border-kitchen-dark-border bg-kitchen-white dark:bg-kitchen-dark-surface hover:border-kitchen-accent-blue/50 dark:hover:border-kitchen-dark-accent-blue/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleModelToggle(model.id)}
              >
                {/* Selection indicator */}
                {isModelSelected(model.id) && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-kitchen-accent-blue dark:bg-kitchen-dark-accent-blue rounded-full flex items-center justify-center"
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
                <div className="text-center flex-1 flex flex-col">
                  <h3 className="font-semibold text-kitchen-text dark:text-kitchen-dark-text text-sm mb-1">
                    {model.name}
                  </h3>
                  <p
                    className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light mb-3 flex-1 overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {model.description}
                  </p>

                  {/* Counter input - always reserve space */}
                  <div className="h-8 flex items-center justify-center">
                    {isModelSelected(model.id) ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleCountChange(model.id, getModelCount(model.id) - 1)}
                          className="w-6 h-6 rounded-full bg-kitchen-light-gray dark:bg-kitchen-dark-surface-light flex items-center justify-center text-kitchen-text dark:text-kitchen-dark-text hover:bg-kitchen-accent-blue/20 transition-colors"
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
                        <span className="text-sm font-medium text-kitchen-text dark:text-kitchen-dark-text min-w-[2rem]">
                          {getModelCount(model.id)}
                        </span>
                        <button
                          onClick={() => handleCountChange(model.id, getModelCount(model.id) + 1)}
                          className="w-6 h-6 rounded-full bg-kitchen-light-gray dark:bg-kitchen-dark-surface-light flex items-center justify-center text-kitchen-text dark:text-kitchen-dark-text hover:bg-kitchen-accent-blue/20 transition-colors"
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
                      <div className="h-6" /> // Invisible spacer to maintain consistent height
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border-2 border-dashed border-kitchen-light-gray dark:border-kitchen-dark-border bg-transparent h-32 w-full flex flex-col justify-center">
                <div className="text-center text-kitchen-text-light dark:text-kitchen-dark-text-light">
                  <svg
                    className="w-8 h-8 mx-auto mb-2 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-xs">More models coming soon</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      {selectedModels.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-kitchen-light-gray dark:bg-kitchen-dark-surface-light rounded-lg p-4"
        >
          <h3 className="font-semibold text-kitchen-text dark:text-kitchen-dark-text mb-2">
            Selected Models ({selectedModels.reduce((sum, s) => sum + s.count, 0)} total columns)
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedModels.map((selection) => {
              const model = models.find((m) => m.id === selection.modelId);
              return (
                <span
                  key={selection.modelId}
                  className="inline-flex items-center space-x-1 bg-kitchen-accent-blue/10 dark:bg-kitchen-dark-accent-blue/20 text-kitchen-accent-blue dark:text-kitchen-dark-accent-blue px-2 py-1 rounded-full text-sm"
                >
                  <span>{model?.name}</span>
                  <span className="bg-kitchen-accent-blue dark:bg-kitchen-dark-accent-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {selection.count}
                  </span>
                </span>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
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
            <span className="text-yellow-800 dark:text-yellow-200 text-sm">
              Select at least one model to start generating content
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
