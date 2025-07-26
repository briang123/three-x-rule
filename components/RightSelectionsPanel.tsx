'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedSentence } from '@/app/page';

interface RightSelectionsPanelProps {
  selectedSentences: SelectedSentence[];
  onRemoveSentence: (id: string) => void;
  onGenerateFinal: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export default function RightSelectionsPanel({
  selectedSentences,
  onRemoveSentence,
  onGenerateFinal,
  isGenerating,
}: RightSelectionsPanelProps) {
  const [prompt, setPrompt] = useState('');

  const getSourceColor = (source: 'A' | 'B' | 'C') => {
    switch (source) {
      case 'A':
        return 'bg-blue-500';
      case 'B':
        return 'bg-green-500';
      case 'C':
        return 'bg-purple-500';
    }
  };

  const handleGenerateFinal = async () => {
    if (!prompt.trim() || selectedSentences.length === 0) return;
    await onGenerateFinal(prompt.trim());
    setPrompt('');
  };

  return (
    <motion.div
      className="w-80 bg-kitchen-white border-l border-kitchen-light-gray flex flex-col h-full"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-kitchen-light-gray flex-shrink-0">
        <h2 className="text-lg font-semibold text-kitchen-text mb-2">Your Selections</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-kitchen-text-light">
            {selectedSentences.length} sentence{selectedSentences.length !== 1 ? 's' : ''} selected
          </span>
          {selectedSentences.length > 0 && (
            <div className="flex space-x-1">
              {(['A', 'B', 'C'] as const).map((source) => {
                const count = selectedSentences.filter((s) => s.source === source).length;
                if (count === 0) return null;
                return (
                  <div
                    key={source}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium ${getSourceColor(
                      source,
                    )}`}
                  >
                    {count}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Selected Sentences */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedSentences.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-kitchen-text-light text-lg mb-2">No selections yet</div>
            <p className="text-sm text-kitchen-text-light">
              Click on sentences from the outputs to add them to your selections
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedSentences.map((sentence, index) => (
              <motion.div
                key={sentence.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-start space-x-3 p-3 bg-kitchen-light-gray rounded-xl"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${getSourceColor(
                    sentence.source,
                  )}`}
                >
                  {sentence.source}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-kitchen-text leading-relaxed">{sentence.text}</p>
                </div>
                <button
                  onClick={() => onRemoveSentence(sentence.id)}
                  className="text-kitchen-text-light hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Remove selection"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Generate Final Response Section */}
      {selectedSentences.length > 0 && (
        <div className="p-6 border-t border-kitchen-light-gray flex-shrink-0">
          <h3 className="text-sm font-semibold text-kitchen-text mb-3">Generate Final Response</h3>
          <div className="space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Add context or instructions for the final response..."
              className="kitchen-input w-full resize-none"
              rows={3}
              maxLength={500}
              disabled={isGenerating}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-kitchen-text-light">
                {prompt.length}/500 characters
              </span>
            </div>
            <button
              onClick={handleGenerateFinal}
              disabled={!prompt.trim() || isGenerating}
              className="kitchen-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
                    <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
                    <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" />
                  </svg>
                  <span>Generate Final Response</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
