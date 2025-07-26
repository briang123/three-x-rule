'use client';

import { motion } from 'framer-motion';
import { FinalResponseData } from '@/app/page';

interface FinalResponseProps {
  finalResponses: FinalResponseData[];
}

export default function FinalResponse({ finalResponses }: FinalResponseProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!finalResponses || finalResponses.length === 0) {
    return (
      <div className="kitchen-card p-6">
        <div className="text-red-500">No final responses available.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {finalResponses.map((data, index) => (
        <motion.div
          key={data.id}
          className="kitchen-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-kitchen-text">Final Response</h3>
                <p className="text-sm text-kitchen-text-light">
                  {formatDate(new Date(data.timestamp))}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-kitchen-text-light bg-kitchen-light-gray px-2 py-1 rounded-lg">
                {data.selectedSentences.length} selections
              </span>
            </div>
          </div>

          {/* Original Prompt */}
          <div className="mb-4 p-4 bg-kitchen-light-gray rounded-xl">
            <h4 className="text-sm font-medium text-kitchen-text mb-2">Original Prompt</h4>
            <p className="text-sm text-kitchen-text-light">{data.prompt}</p>
          </div>

          {/* Selected Sentences Summary */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-kitchen-text mb-2">Selected Sentences</h4>
            <div className="flex flex-wrap gap-2">
              {data.selectedSentences.map((sentence) => (
                <span
                  key={sentence.id}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
                    sentence.source === 'A'
                      ? 'bg-blue-100 text-blue-700'
                      : sentence.source === 'B'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  <span>{sentence.source}</span>
                  <span>•</span>
                  <span className="truncate max-w-32">{sentence.text}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Final Response Content */}
          <div className="bg-gradient-to-r from-kitchen-muted-blue to-blue-50 p-4 rounded-xl border border-kitchen-accent-blue/20">
            <h4 className="text-sm font-medium text-kitchen-text mb-2">Refined Response</h4>
            <p className="text-sm text-kitchen-text leading-relaxed">{data.response}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
