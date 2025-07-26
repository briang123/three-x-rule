'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ContextPanelProps {
  context: {
    text?: string;
    systemPrompt?: string;
  };
  onContextChange: (context: { text?: string; systemPrompt?: string }) => void;
  disabled?: boolean;
}

export default function ContextPanel({
  context,
  onContextChange,
  disabled = false,
}: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState<'system' | 'context'>('system');

  const handleSystemPromptChange = (value: string) => {
    onContextChange({
      ...context,
      systemPrompt: value,
    });
  };

  const handleContextTextChange = (value: string) => {
    onContextChange({
      ...context,
      text: value,
    });
  };

  return (
    <motion.div
      className="bg-kitchen-white border border-kitchen-light-gray rounded-xl p-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-kitchen-text">Additional Context</h3>
          <div className="flex space-x-1 bg-kitchen-light-gray rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                activeTab === 'system'
                  ? 'bg-kitchen-white text-kitchen-text shadow-sm'
                  : 'text-kitchen-text-light hover:text-kitchen-text'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              disabled={disabled}
            >
              System Prompt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('context')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                activeTab === 'context'
                  ? 'bg-kitchen-white text-kitchen-text shadow-sm'
                  : 'text-kitchen-text-light hover:text-kitchen-text'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              disabled={disabled}
            >
              Context Text
            </button>
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'system' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-kitchen-text mb-2">
                  System Prompt
                </label>
                <textarea
                  value={context.systemPrompt || ''}
                  onChange={(e) => handleSystemPromptChange(e.target.value)}
                  placeholder="Enter a system prompt to guide the AI's behavior and responses..."
                  className="kitchen-input w-full resize-none"
                  rows={4}
                  maxLength={2000}
                  disabled={disabled}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-kitchen-text-light">
                    {(context.systemPrompt || '').length}/2000 characters
                  </span>
                  <span className="text-xs text-kitchen-text-light">Optional</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 System Prompt Tips</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Define the AI's role and expertise</li>
                  <li>• Set response style and tone</li>
                  <li>• Specify output format requirements</li>
                  <li>• Include any constraints or guidelines</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-kitchen-text mb-2">
                  Context Text
                </label>
                <textarea
                  value={context.text || ''}
                  onChange={(e) => handleContextTextChange(e.target.value)}
                  placeholder="Add additional context, background information, or reference material..."
                  className="kitchen-input w-full resize-none"
                  rows={4}
                  maxLength={5000}
                  disabled={disabled}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-kitchen-text-light">
                    {(context.text || '').length}/5000 characters
                  </span>
                  <span className="text-xs text-kitchen-text-light">Optional</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-green-800 mb-2">📚 Context Text Tips</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Include relevant background information</li>
                  <li>• Add reference documents or data</li>
                  <li>• Provide specific examples or scenarios</li>
                  <li>• Include any constraints or requirements</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>

        {(context.systemPrompt || context.text) && (
          <motion.div
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <div className="text-xs text-yellow-800">
                <strong>Note:</strong> Additional context will be included with your message and may
                affect token usage and response quality.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
