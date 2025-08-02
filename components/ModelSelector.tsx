'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '@/hooks';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const { models, loading, error } = useModels();

  if (loading) {
    return (
      <div className="bg-kitchen-white dark:bg-kitchen-dark-surface border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-xl p-4 transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-4 h-4 border-2 border-kitchen-accent-blue dark:border-kitchen-dark-accent-blue border-t-transparent rounded-full"
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
      <div className="bg-kitchen-white dark:bg-kitchen-dark-surface border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-xl p-4 transition-colors duration-200">
        <div className="text-red-500 text-sm">Error: {error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-kitchen-white dark:bg-kitchen-dark-surface border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-xl p-4 transition-colors duration-200"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-kitchen-text dark:text-kitchen-dark-text">
            Select Model
          </h3>
          <span className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light">
            {models.length} models available
          </span>
        </div>

        <div className="space-y-2">
          {models.map((model) => (
            <motion.div
              key={model.id}
              className={`relative p-3 rounded-lg border cursor-pointer transition-all
                ${
                  selectedModel === model.id
                    ? 'border-kitchen-accent-blue dark:border-kitchen-dark-accent-blue bg-kitchen-accent-blue/5 dark:bg-kitchen-dark-surface-light text-kitchen-text dark:text-kitchen-dark-text'
                    : 'border-kitchen-light-gray dark:border-kitchen-dark-border bg-kitchen-white dark:bg-kitchen-dark-surface text-kitchen-text dark:text-kitchen-dark-text hover:border-kitchen-accent-blue/50 dark:hover:border-kitchen-dark-accent-blue/50 hover:bg-kitchen-light-gray dark:hover:bg-kitchen-dark-surface-light hover:text-kitchen-text dark:hover:text-kitchen-dark-text'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !disabled && onModelChange(model.id)}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-kitchen-text dark:text-kitchen-dark-text">
                    {model.name}
                  </h4>
                  {selectedModel === model.id && (
                    <motion.div
                      className="w-2 h-2 bg-kitchen-accent-blue dark:bg-kitchen-dark-accent-blue rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
                <p className="text-sm text-kitchen-text-light dark:text-kitchen-dark-text-light mt-1">
                  {model.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-kitchen-light-gray dark:bg-kitchen-dark-surface-light text-kitchen-text dark:text-kitchen-dark-text px-2 py-1 rounded">
                    {model.maxInputTokens.toLocaleString()} input tokens
                  </span>
                  <span className="text-xs bg-kitchen-light-gray dark:bg-kitchen-dark-surface-light text-kitchen-text dark:text-kitchen-dark-text px-2 py-1 rounded">
                    {model.maxOutputTokens.toLocaleString()} output tokens
                  </span>
                  {model.supportsImages && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Images
                    </span>
                  )}
                  {model.supportsVideo && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      Video
                    </span>
                  )}
                  {model.supportsAudio && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      Audio
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-xs text-kitchen-text-light pt-2 border-t border-kitchen-light-gray dark:border-kitchen-dark-border dark:text-kitchen-dark-text-light">
          <p>
            💡 <strong>Pro tip:</strong> Use Gemini 2.5 Pro for complex reasoning, Gemini 2.5 Flash
            for balanced performance, or Gemini 2.5 Flash Lite for cost efficiency.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
