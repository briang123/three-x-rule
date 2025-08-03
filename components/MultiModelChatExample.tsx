'use client';

import { useState } from 'react';
import { useMultiModelChat } from '@/hooks/useMultiModelChat';
import { ModelSelection } from '@/components/ModelGridSelector';

export default function MultiModelChatExample() {
  const [modelSelections, setModelSelections] = useState<ModelSelection[]>([
    { modelId: 'gemini-2.0-flash', count: 2 },
    { modelId: 'gemini-2.5-pro', count: 1 },
  ]);

  const [prompt, setPrompt] = useState('');

  const { handleSubmit, isLoading, messages, originalResponses, isGenerating, resetAll } =
    useMultiModelChat({
      modelSelections,
      onModelFinish: (modelId, messageKey, content) => {
        console.log(`Model ${modelId} finished for message ${messageKey}:`, content);
      },
      onModelError: (modelId, messageKey, error) => {
        console.error(`Model ${modelId} error for message ${messageKey}:`, error);
      },
    });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      await handleSubmit(prompt);
    } catch (error) {
      console.error('Error submitting prompt:', error);
    }
  };

  return (
    <div
      className="p-6 max-w-4xl mx-auto"
      style={{
        padding: '1.5rem',
        maxWidth: '64rem',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1
        className="text-2xl font-bold mb-6"
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          color: '#1f2937',
        }}
      >
        Multi-Model Chat Example
      </h1>

      {/* Model Selections */}
      <div className="mb-6" style={{ marginBottom: '1.5rem' }}>
        <h2
          className="text-lg font-semibold mb-2"
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#1f2937',
          }}
        >
          Selected Models:
        </h2>
        <div className="space-y-2" style={{ marginTop: '0.5rem' }}>
          {modelSelections.map((selection, index) => (
            <div
              key={index}
              className="flex items-center space-x-2"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <span
                className="font-mono text-sm bg-gray-100 px-2 py-1 rounded"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  backgroundColor: '#f3f4f6',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  color: '#374151',
                }}
              >
                {selection.modelId}
              </span>
              <span className="text-gray-600" style={{ color: '#4b5563' }}>
                × {selection.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleFormSubmit} className="mb-6" style={{ marginBottom: '1.5rem' }}>
        <div className="flex space-x-2" style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            style={{
              flex: '1',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              color: '#1f2937',
              backgroundColor: '#ffffff',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isLoading ? 'Generating...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6b7280',
              color: '#ffffff',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Loading States */}
      {isLoading && (
        <div className="mb-6" style={{ marginBottom: '1.5rem' }}>
          <h3
            className="text-lg font-semibold mb-2"
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1f2937',
            }}
          >
            Generating Responses:
          </h3>
          <div className="space-y-2" style={{ marginTop: '0.5rem' }}>
            {Object.entries(isGenerating).map(([messageKey, generating]) => (
              <div
                key={messageKey}
                className="flex items-center space-x-2"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  className="font-mono text-sm"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: '#374151',
                  }}
                >
                  Message {messageKey}:
                </span>
                {generating ? (
                  <span className="text-blue-500" style={{ color: '#3b82f6' }}>
                    Generating...
                  </span>
                ) : (
                  <span className="text-green-500" style={{ color: '#10b981' }}>
                    Complete
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responses */}
      {Object.keys(originalResponses).length > 0 && (
        <div className="space-y-4" style={{ marginTop: '1rem' }}>
          <h3
            className="text-lg font-semibold"
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
            }}
          >
            Responses:
          </h3>
          {Object.entries(originalResponses).map(([messageKey, response]) => (
            <div
              key={messageKey}
              className="border border-gray-200 rounded-lg p-4"
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#ffffff',
              }}
            >
              <h4
                className="font-semibold mb-2"
                style={{
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#1f2937',
                }}
              >
                Message {messageKey}
              </h4>
              <div
                className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap"
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  color: '#374151',
                  lineHeight: '1.5',
                }}
              >
                {response}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Streaming Messages */}
      {Object.keys(messages).length > 0 && (
        <div className="mt-6" style={{ marginTop: '1.5rem' }}>
          <h3
            className="text-lg font-semibold mb-2"
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem',
            }}
          >
            Streaming Messages:
          </h3>
          {Object.entries(messages).map(([messageKey, messageArray]) => (
            <div key={messageKey} className="mb-4" style={{ marginBottom: '1rem' }}>
              <h4
                className="font-semibold mb-2"
                style={{
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#1f2937',
                }}
              >
                Message {messageKey} (Streaming):
              </h4>
              <div
                className="bg-gray-50 p-3 rounded text-sm"
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  lineHeight: '1.5',
                }}
              >
                {messageArray.join('')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
