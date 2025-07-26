'use client';

import { useState } from 'react';

export default function TestAttachments() {
  const [files, setFiles] = useState<File[]>([]);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    setLoading(true);
    setResponse('');

    try {
      const formData = new FormData();
      formData.append(
        'jsonData',
        JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Please analyze the attached files and provide a summary.',
            },
          ],
          model: 'gemini-2.0-flash',
          stream: false,
        }),
      );

      // Add files to form data
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });

      const apiResponse = await fetch('/api/chat/with-attachments', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`HTTP ${apiResponse.status}: ${errorText}`);
      }

      const result = await apiResponse.json();
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">File Attachment Test</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Files (Text files, Markdown, PDFs, Word docs, or images)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            accept=".txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {files.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Selected Files:</h3>
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || files.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Test API'}
        </button>

        {response && (
          <div>
            <h3 className="font-medium mb-2">Response:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">{response}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
