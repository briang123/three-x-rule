'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModelInfo } from '@/lib/api-client';

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
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="bg-kitchen-white border border-kitchen-light-gray rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-4 h-4 border-2 border-kitchen-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-kitchen-text">Loading models...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-kitchen-white border border-kitchen-light-gray rounded-xl p-4">
        <div className="text-red-500 text-sm">Error: {error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-kitchen-white border border-kitchen-light-gray rounded-xl p-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-kitchen-text">Select Model</h3>
          <span className="text-xs text-kitchen-text-light">{models.length} models available</span>
        </div>

        <div className="space-y-2">
          {models.map((model) => (
            <motion.div
              key={model.id}
              className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                selectedModel === model.id
                  ? 'border-kitchen-primary bg-kitchen-primary/5'
                  : 'border-kitchen-light-gray hover:border-kitchen-primary/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onModelChange(model.id)}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-kitchen-text">{model.name}</h4>
                    {selectedModel === model.id && (
                      <motion.div
                        className="w-2 h-2 bg-kitchen-primary rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                  <p className="text-sm text-kitchen-text-light mt-1">{model.description}</p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-kitchen-light-gray px-2 py-1 rounded">
                      {model.maxInputTokens.toLocaleString()} input tokens
                    </span>
                    <span className="text-xs bg-kitchen-light-gray px-2 py-1 rounded">
                      {model.maxOutputTokens.toLocaleString()} output tokens
                    </span>
                    {model.supportsImages && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Images
                      </span>
                    )}
                    {model.supportsVideo && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Video
                      </span>
                    )}
                    {model.supportsAudio && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Audio
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-xs text-kitchen-text-light pt-2 border-t border-kitchen-light-gray">
          <p>
            💡 <strong>Pro tip:</strong> Use Gemini 2.5 Pro for complex reasoning, Gemini 2.5 Flash
            for balanced performance, or Gemini 2.5 Flash Lite for cost efficiency.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
