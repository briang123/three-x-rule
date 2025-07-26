'use client';

import { useState } from 'react';

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setTestResult('Testing API...\n');

    try {
      // Test GET /api/chat
      const response = await fetch('/api/chat');
      const data = await response.json();

      if (data.success) {
        setTestResult(
          (prev) =>
            prev + `✅ Models loaded successfully: ${data.data.models.length} models found\n`,
        );

        // Test POST /api/chat
        const postResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Say hello in one sentence.' }],
            model: 'gemini-2.0-flash',
          }),
        });

        const postData = await postResponse.json();

        if (postData.success) {
          setTestResult(
            (prev) => prev + `✅ Chat API working: "${postData.data.content.trim()}"\n`,
          );
        } else {
          setTestResult((prev) => prev + `❌ Chat API failed: ${postData.error}\n`);
        }
      } else {
        setTestResult((prev) => prev + `❌ Models API failed: ${data.error}\n`);
      }
    } catch (error) {
      setTestResult(
        (prev) =>
          prev + `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>

        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 mb-6"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
            {testResult || 'Click "Test API" to run tests...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
