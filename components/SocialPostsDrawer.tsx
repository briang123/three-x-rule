'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelInfo } from '@/lib/api-client';

export interface SocialPostConfig {
  platform: string;
  modelId: string;
  postType: string;
  numberOfPosts: number;
  characterLimit: number;
  isThreaded: boolean;
  customPrompt?: string;
  selectedColumns?: string[];
}

interface SocialPostsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: SocialPostConfig) => void;
  availableColumns?: { [key: string]: string };
}

const PLATFORMS = [
  { id: 'twitter', name: 'X (Twitter)', icon: '🐦' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
];

const POST_TYPES = [
  { id: 'tweet', name: 'Tweet', characterLimit: 280, isThreaded: true },
  { id: 'thread', name: 'Thread', characterLimit: 280, isThreaded: true },
  { id: 'article', name: 'Article', characterLimit: 5000, isThreaded: false },
  { id: 'post', name: 'Post', characterLimit: 1000, isThreaded: false },
  { id: 'caption', name: 'Caption', characterLimit: 2200, isThreaded: false },
];

export default function SocialPostsDrawer({
  isOpen,
  onClose,
  onGenerate,
  availableColumns = {},
}: SocialPostsDrawerProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SocialPostConfig>({
    platform: 'twitter',
    modelId: '',
    postType: 'tweet',
    numberOfPosts: 1,
    characterLimit: 280,
    isThreaded: false,
    customPrompt: '',
    selectedColumns: [],
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/chat');
        const data = await response.json();

        if (data.success) {
          setModels(data.data.models);
          if (data.data.models.length > 0) {
            setConfig((prev) => ({ ...prev, modelId: data.data.models[0].id }));
          }
        }
      } catch (err) {
        console.error('Error fetching models:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const handlePostTypeChange = (postType: string) => {
    const selectedType = POST_TYPES.find((type) => type.id === postType);
    setConfig((prev) => ({
      ...prev,
      postType,
      characterLimit: selectedType?.characterLimit || 280,
      isThreaded: selectedType?.isThreaded || false,
      numberOfPosts: selectedType?.isThreaded ? Math.max(prev.numberOfPosts, 2) : 1,
    }));
  };

  const handleColumnToggle = (columnKey: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedColumns: prev.selectedColumns?.includes(columnKey)
        ? prev.selectedColumns.filter((col) => col !== columnKey)
        : [...(prev.selectedColumns || []), columnKey],
    }));
  };

  const handleGenerate = () => {
    if (!config.modelId) {
      alert('Please select a model');
      return;
    }
    onGenerate(config);
    onClose();
  };

  const selectedPlatform = PLATFORMS.find((p) => p.id === config.platform);
  const selectedPostType = POST_TYPES.find((t) => t.id === config.postType);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-kitchen-white dark:bg-kitchen-dark-surface border-l border-kitchen-light-gray dark:border-kitchen-dark-border z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-kitchen-text dark:text-kitchen-dark-text">
                  Social Posts
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-kitchen-dark-surface-light transition-colors"
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

              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-kitchen-text dark:text-kitchen-dark-text mb-3">
                  Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setConfig((prev) => ({ ...prev, platform: platform.id }))}
                      className={`p-3 rounded-lg border transition-all ${
                        config.platform === platform.id
                          ? 'border-kitchen-accent-blue dark:border-kitchen-dark-accent-blue bg-kitchen-accent-blue/5 dark:bg-kitchen-dark-surface-light'
                          : 'border-kitchen-light-gray dark:border-kitchen-dark-border hover:border-kitchen-accent-blue/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{platform.icon}</div>
                        <div className="text-xs font-medium">{platform.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-kitchen-text dark:text-kitchen-dark-text mb-3">
                  AI Model
                </label>
                {loading ? (
                  <div className="p-3 bg-kitchen-light-gray dark:bg-kitchen-dark-surface-light rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-kitchen-accent-blue border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Loading models...</span>
                    </div>
                  </div>
                ) : (
                  <select
                    value={config.modelId}
                    onChange={(e) => setConfig((prev) => ({ ...prev, modelId: e.target.value }))}
                    className="w-full p-3 border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-lg bg-kitchen-white dark:bg-kitchen-dark-surface text-kitchen-text dark:text-kitchen-dark-text"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Post Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-kitchen-text dark:text-kitchen-dark-text mb-3">
                  Post Type
                </label>
                <div className="space-y-2">
                  {POST_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handlePostTypeChange(type.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        config.postType === type.id
                          ? 'border-kitchen-accent-blue dark:border-kitchen-dark-accent-blue bg-kitchen-accent-blue/5 dark:bg-kitchen-dark-surface-light'
                          : 'border-kitchen-light-gray dark:border-kitchen-dark-border hover:border-kitchen-accent-blue/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light">
                            {type.characterLimit} characters
                            {type.isThreaded && ' • Threaded'}
                          </div>
                        </div>
                        {config.postType === type.id && (
                          <div className="w-2 h-2 bg-kitchen-accent-blue dark:bg-kitchen-dark-accent-blue rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Posts */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-kitchen-text dark:text-kitchen-dark-text mb-3">
                  Number of Posts to Generate
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.numberOfPosts}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      numberOfPosts: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full p-3 border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-lg bg-kitchen-white dark:bg-kitchen-dark-surface text-kitchen-text dark:text-kitchen-dark-text"
                />
                <div className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light mt-1">
                  {config.isThreaded
                    ? 'Each post will be part of a thread'
                    : 'Each post will be separate'}
                </div>
              </div>

              {/* Column Selection */}
              {Object.keys(availableColumns).length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-kitchen-text dark:text-kitchen-dark-text mb-3">
                    Select Context Columns (Optional)
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(availableColumns).map(([columnKey, columnContent]) => (
                      <button
                        key={columnKey}
                        onClick={() => handleColumnToggle(columnKey)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          config.selectedColumns?.includes(columnKey)
                            ? 'border-kitchen-accent-blue dark:border-kitchen-dark-accent-blue bg-kitchen-accent-blue/5 dark:bg-kitchen-dark-surface-light'
                            : 'border-kitchen-light-gray dark:border-kitchen-dark-border hover:border-kitchen-accent-blue/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">Column {columnKey}</div>
                            <div className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light truncate">
                              {columnContent.substring(0, 100)}
                              {columnContent.length > 100 ? '...' : ''}
                            </div>
                          </div>
                          {config.selectedColumns?.includes(columnKey) && (
                            <div className="w-2 h-2 bg-kitchen-accent-blue dark:bg-kitchen-dark-accent-blue rounded-full ml-2 flex-shrink-0"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light mt-1">
                    Select columns to include as context for social post generation
                  </div>
                </div>
              )}

              {/* Custom Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-kitchen-text dark:text-kitchen-dark-text mb-3">
                  Custom Prompt (Optional)
                </label>
                <textarea
                  value={config.customPrompt}
                  onChange={(e) => setConfig((prev) => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Enter a specific prompt for generating social posts..."
                  rows={3}
                  className="w-full p-3 border border-kitchen-light-gray dark:border-kitchen-dark-border rounded-lg bg-kitchen-white dark:bg-kitchen-dark-surface text-kitchen-text dark:text-kitchen-dark-text resize-none"
                />
                <div className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light mt-1">
                  Leave empty to use selected columns or existing responses
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6 p-4 bg-kitchen-light-gray dark:bg-kitchen-dark-surface-light rounded-lg">
                <h3 className="font-medium text-kitchen-text dark:text-kitchen-dark-text mb-2">
                  Summary
                </h3>
                <div className="text-sm text-kitchen-text-light dark:text-kitchen-dark-text-light space-y-1">
                  <div>Platform: {selectedPlatform?.name}</div>
                  <div>Type: {selectedPostType?.name}</div>
                  <div>Character Limit: {config.characterLimit}</div>
                  {config.isThreaded && <div>Thread Length: {config.numberOfPosts} posts</div>}
                  {config.selectedColumns && config.selectedColumns.length > 0 && (
                    <div>Context Columns: {config.selectedColumns.join(', ')}</div>
                  )}
                  {config.customPrompt && <div>Custom Prompt: Yes</div>}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!config.modelId}
                className="w-full kitchen-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Social Posts
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
