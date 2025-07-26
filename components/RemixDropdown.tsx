'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModelInfo } from '@/lib/api-client';

interface RemixDropdownProps {
  onRemix: (modelId: string) => void;
  disabled?: boolean;
}

export default function RemixDropdown({ onRemix, disabled = false }: RemixDropdownProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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
        <button disabled className="kitchen-button text-sm px-4 py-2 opacity-50 cursor-not-allowed">
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-4 h-4 border-2 border-kitchen-accent-blue dark:border-kitchen-dark-accent-blue border-t-transparent rounded-full"
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
          className="kitchen-button text-sm px-4 py-2 opacity-50 cursor-not-allowed"
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
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`kitchen-button text-sm px-4 py-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Remix</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-1 w-64 bg-kitchen-white dark:bg-kitchen-dark-surface border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
        >
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-kitchen-text-light dark:text-kitchen-dark-text-light border-b border-kitchen-light-gray dark:border-kitchen-dark-border mb-2">
              Select model for remix
            </div>
            <div className="space-y-1">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleRemix(model.id)}
                  className="w-full text-left px-3 py-2 rounded text-sm transition-colors hover:bg-kitchen-light-gray dark:hover:bg-kitchen-dark-surface-light text-kitchen-text dark:text-kitchen-dark-text"
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light truncate">
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
