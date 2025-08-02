'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '@/hooks';

interface RemixButtonCardProps {
  onRemix: (modelId: string) => void;
  onRemixStart?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  responseCount?: number;
}

const RemixButtonCard = React.memo(function RemixButtonCard({
  onRemix,
  onRemixStart,
  disabled = false,
  isGenerating = false,
  responseCount = 0,
}: RemixButtonCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { models, loading, error } = useModels();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleModelSelect = (modelId: string) => {
    if (modelId === 'clear') {
      setSelectedModel('');
    } else {
      setSelectedModel(modelId);
    }
    setIsOpen(false);
  };

  const handleRemix = () => {
    if (selectedModel) {
      // Call the scroll callback first
      if (onRemixStart) {
        onRemixStart();
      }
      // Then trigger the remix
      onRemix(selectedModel);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="bg-kitchen-white dark:bg-kitchen-dark-surface border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-xl p-6 shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-4 h-4 border-2 border-kitchen-accent-blue dark:border-kitchen-dark-accent-blue border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-kitchen-text dark:text-kitchen-dark-text">Loading models...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-kitchen-white dark:bg-kitchen-dark-surface border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-xl p-6 shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-red-500 text-sm">Error: {error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-purple-900/20 border-2 border-dashed border-purple-400/30 rounded-xl p-8 shadow-lg w-full hover:border-purple-400/50 transition-colors duration-200"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-6">
        {/* Remix Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white">Remix Responses</h2>

        {/* Subtitle */}
        <p className="text-base text-gray-300">
          Combine the best parts from all {responseCount} AI responses into a curated synthesis.
        </p>

        {/* Model Selection Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex justify-center">
            <div className="relative w-1/2">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled || isGenerating}
                className={`w-full px-6 py-4 text-left bg-gray-800 border border-gray-600 rounded-lg transition-all duration-200 ${
                  disabled || isGenerating
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white">
                    {selectedModel
                      ? models.find((m) => m.id === selectedModel)?.name || 'Select Model'
                      : 'Select Model for Remix'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-[9999] max-h-64 overflow-y-auto"
                >
                  <div className="p-2">
                    {/* Clear Selection Option */}
                    <button
                      type="button"
                      onClick={() => handleModelSelect('clear')}
                      className="w-full text-left px-3 py-2 rounded text-sm transition-colors hover:bg-gray-700 text-white"
                    >
                      Clear Selection
                    </button>

                    {/* Model Options */}
                    {models.map((model) => (
                      <button
                        type="button"
                        key={model.id}
                        onClick={() => handleModelSelect(model.id)}
                        className="w-full text-left px-3 py-2 rounded text-sm transition-colors hover:bg-gray-700 text-white"
                      >
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-gray-400 break-words">{model.description}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Remix Button */}
        <button
          type="button"
          onClick={handleRemix}
          disabled={disabled || isGenerating || !selectedModel}
          className={`w-1/2 px-6 py-4 rounded-lg font-medium transition-all duration-200 ${
            disabled || isGenerating || !selectedModel
              ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:scale-105'
          } ${isGenerating ? 'animate-pulse' : ''}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isGenerating ? 'Generating...' : 'Remix'}</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
});

export default RemixButtonCard;
