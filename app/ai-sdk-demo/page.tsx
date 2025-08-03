import MultiModelChatExample from '@/components/MultiModelChatExample';

export default function AISDKDemoPage() {
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ color: '#1f2937', fontSize: '2rem', fontWeight: 'bold' }}
          >
            Vercel AI SDK Demo
          </h1>
          <p className="text-gray-600" style={{ color: '#4b5563', fontSize: '1.125rem' }}>
            Multi-model chat implementation using Vercel AI SDK
          </p>
        </div>

        <MultiModelChatExample />

        <div
          className="mt-12 p-6 bg-white rounded-lg shadow-sm"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            marginTop: '3rem',
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
            }}
          >
            Implementation Details
          </h2>
          <div
            className="space-y-4 text-sm text-gray-700"
            style={{
              color: '#374151',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
          >
            <div>
              <h3
                className="font-semibold"
                style={{
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                ✅ What's Implemented:
              </h3>
              <ul
                className="list-disc list-inside ml-4 space-y-1"
                style={{
                  listStyleType: 'disc',
                  paddingLeft: '1rem',
                  marginTop: '0.25rem',
                }}
              >
                <li style={{ marginBottom: '0.25rem' }}>
                  Vercel AI SDK integration with{' '}
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    useChat
                  </code>{' '}
                  hook
                </li>
                <li style={{ marginBottom: '0.25rem' }}>Multi-model orchestration wrapper hook</li>
                <li style={{ marginBottom: '0.25rem' }}>
                  Streaming responses for each model independently
                </li>
                <li style={{ marginBottom: '0.25rem' }}>
                  Updated API route using{' '}
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    streamText
                  </code>
                </li>
                <li style={{ marginBottom: '0.25rem' }}>
                  Proper error handling and loading states
                </li>
                <li style={{ marginBottom: '0.25rem' }}>
                  Maintains existing Gemini service compatibility
                </li>
              </ul>
            </div>

            <div>
              <h3
                className="font-semibold"
                style={{
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                🔧 Key Features:
              </h3>
              <ul
                className="list-disc list-inside ml-4 space-y-1"
                style={{
                  listStyleType: 'disc',
                  paddingLeft: '1rem',
                  marginTop: '0.25rem',
                }}
              >
                <li style={{ marginBottom: '0.25rem' }}>
                  Each model gets its own{' '}
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    useChat
                  </code>{' '}
                  instance
                </li>
                <li style={{ marginBottom: '0.25rem' }}>Independent streaming per model</li>
                <li style={{ marginBottom: '0.25rem' }}>Aggregated loading states</li>
                <li style={{ marginBottom: '0.25rem' }}>
                  Callback support for completion and errors
                </li>
                <li style={{ marginBottom: '0.25rem' }}>Reset functionality for all instances</li>
              </ul>
            </div>

            <div>
              <h3
                className="font-semibold"
                style={{
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                📁 Files Created/Modified:
              </h3>
              <ul
                className="list-disc list-inside ml-4 space-y-1"
                style={{
                  listStyleType: 'disc',
                  paddingLeft: '1rem',
                  marginTop: '0.25rem',
                }}
              >
                <li style={{ marginBottom: '0.25rem' }}>
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    hooks/useMultiModelChat.ts
                  </code>{' '}
                  - Main wrapper hook
                </li>
                <li style={{ marginBottom: '0.25rem' }}>
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    app/api/chat/route.ts
                  </code>{' '}
                  - Updated with Vercel AI SDK
                </li>
                <li style={{ marginBottom: '0.25rem' }}>
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    components/MultiModelChatExample.tsx
                  </code>{' '}
                  - Demo component
                </li>
                <li style={{ marginBottom: '0.25rem' }}>
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    test/mocks/ai-react.js
                  </code>{' '}
                  - Test mock
                </li>
                <li style={{ marginBottom: '0.25rem' }}>
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    jest.config.js
                  </code>{' '}
                  - Updated for AI SDK
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
