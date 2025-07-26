'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ModelInfo } from '@/lib/api-client';

interface RemixDropdownProps {
  onRemix: (modelId: string) => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

export default function RemixDropdown({
  onRemix,
  disabled = false,
  isGenerating = false,
}: RemixDropdownProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openDirection, setOpenDirection] = useState<'up' | 'down'>('up');

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.remix-dropdown')) {
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

  const handleRemix = (modelId: string) => {
    onRemix(modelId);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="relative remix-dropdown">
        <button
          disabled
          className="px-3 py-1.5 text-xs rounded-lg opacity-50 cursor-not-allowed bg-gray-200 text-gray-500"
        >
          <div className="flex items-center space-x-1">
            <motion.div
              className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Loading...</span>
          </div>
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative remix-dropdown">
        <button
          disabled
          className="px-3 py-1.5 text-xs rounded-lg opacity-50 cursor-not-allowed bg-gray-200 text-gray-500"
          title={`Error: ${error}`}
        >
          Remix
        </button>
      </div>
    );
  }

  return (
    <div className="relative remix-dropdown">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!isOpen) {
            // About to open, measure position
            setTimeout(() => {
              if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                // Estimate dropdown height (e.g. 320px)
                const dropdownHeight = 320;
                if (spaceBelow > dropdownHeight || spaceBelow > spaceAbove) {
                  setOpenDirection('down');
                } else {
                  setOpenDirection('up');
                }
              }
            }, 0);
          }
          setIsOpen(!isOpen);
        }}
        disabled={disabled || isGenerating}
        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
          disabled || isGenerating
            ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:scale-105'
        } ${isGenerating ? 'animate-pulse' : ''}`}
      >
        <div className="flex items-center space-x-1">
          <svg
            className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`}
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
          {!isGenerating && (
            <svg
              className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          )}
        </div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: openDirection === 'down' ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: openDirection === 'down' ? -10 : 10 }}
          className={`absolute left-0 w-64 bg-kitchen-white dark:bg-kitchen-dark-surface border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-lg shadow-lg z-10 max-h-[calc(100vh-64px)] overflow-y-auto ${openDirection === 'down' ? 'top-full mt-1' : 'bottom-full mb-1'}`}
        >
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-kitchen-text-light dark:text-kitchen-dark-text-light border-b border-kitchen-light-gray dark:border-kitchen-dark-border mb-2">
              Select model for remix
            </div>
            <div className="space-y-1">
              {models.map((model) => (
                <button
                  type="button"
                  key={model.id}
                  onClick={() => handleRemix(model.id)}
                  className="w-full text-left px-3 py-2 rounded text-sm transition-colors hover:bg-kitchen-light-gray dark:hover:bg-kitchen-dark-surface-light text-kitchen-text dark:text-kitchen-dark-text"
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light break-words">
                    {model.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
