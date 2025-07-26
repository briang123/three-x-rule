// Example usage of the Gemini API backend service
// This file demonstrates how to interact with the backend API endpoints

// Example 1: Basic text chat
async function basicChat() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'Explain the 3X Rule methodology in simple terms',
        },
      ],
      model: 'gemini-2.0-flash',
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  console.log('Basic chat response:', data);
}

// Example 2: Chat with system prompt
async function chatWithSystemPrompt() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'What are the key principles of productivity?',
        },
      ],
      model: 'gemini-2.5-pro',
      context: {
        systemPrompt:
          'You are an expert productivity coach with 20 years of experience. Provide practical, actionable advice in a friendly, encouraging tone. Always include specific examples and actionable steps.',
      },
      temperature: 0.8,
    }),
  });

  const data = await response.json();
  console.log('Chat with system prompt:', data);
}

// Example 3: Chat with additional context
async function chatWithContext() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'How can I apply this methodology to my daily routine?',
        },
      ],
      model: 'gemini-2.5-flash',
      context: {
        text: 'The 3X Rule is a productivity methodology that suggests: 1) Plan three times more than you think you need, 2) Execute with three times more focus, 3) Review and refine three times more thoroughly. This methodology emphasizes thorough preparation, intense focus during execution, and comprehensive review processes.',
        systemPrompt:
          'You are a productivity expert. Provide specific, actionable advice based on the context provided.',
      },
      temperature: 0.6,
    }),
  });

  const data = await response.json();
  console.log('Chat with context:', data);
}

// Example 4: Conversation with history
async function conversationWithHistory() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'What is the 3X Rule?',
        },
        {
          role: 'assistant',
          content:
            'The 3X Rule is a productivity methodology that emphasizes three key principles: planning three times more thoroughly, executing with three times more focus, and reviewing three times more comprehensively than you might initially think necessary.',
        },
        {
          role: 'user',
          content: 'How do I implement the planning aspect?',
        },
      ],
      model: 'gemini-2.5-pro',
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  console.log('Conversation with history:', data);
}

// Example 5: Get available models
async function getAvailableModels() {
  const response = await fetch('/api/chat', {
    method: 'GET',
  });

  const data = await response.json();
  console.log('Available models:', data);
}

// Example 6: Using the API client (frontend)
async function usingApiClient() {
  // This would be used in a React component
  import { apiClient } from '@/lib/api-client';

  // Simple request
  const simpleResponse = await apiClient.sendMessage(
    apiClient.createChatRequest('Explain the benefits of the 3X Rule', 'gemini-2.0-flash', {
      systemPrompt: 'You are a productivity expert',
    }),
  );

  // Request with conversation history
  const historyResponse = await apiClient.sendMessage(
    apiClient.createChatRequestWithHistory(
      [
        { role: 'user', content: 'What is the 3X Rule?' },
        { role: 'assistant', content: 'The 3X Rule is...' },
        { role: 'user', content: 'How do I start implementing it?' },
      ],
      'gemini-2.5-pro',
      {
        systemPrompt: 'Provide step-by-step guidance',
      },
      {
        temperature: 0.8,
        maxTokens: 1000,
      },
    ),
  );

  console.log('Simple response:', simpleResponse);
  console.log('History response:', historyResponse);
}

// Example 7: Error handling
async function handleErrors() {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: '', // Empty content will cause validation error
          },
        ],
        model: 'invalid-model', // Invalid model will cause error
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('API Error:', data.error);
      // Handle error appropriately
      return;
    }

    console.log('Success:', data);
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Example 8: Different models for different use cases
async function modelComparison() {
  const prompt = 'Analyze the following productivity data and provide insights: [Sample data here]';

  // For complex analysis - use Pro model
  const proResponse = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'gemini-2.5-pro',
      temperature: 0.3, // Lower temperature for more focused analysis
    }),
  });

  // For quick responses - use Flash model
  const flashResponse = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'gemini-2.5-flash',
      temperature: 0.7,
    }),
  });

  // For cost efficiency - use Flash Lite
  const liteResponse = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'gemini-2.5-flash-lite',
      temperature: 0.7,
    }),
  });

  console.log('Pro model response:', await proResponse.json());
  console.log('Flash model response:', await flashResponse.json());
  console.log('Flash Lite response:', await liteResponse.json());
}

// Export functions for use in other files
export {
  basicChat,
  chatWithSystemPrompt,
  chatWithContext,
  conversationWithHistory,
  getAvailableModels,
  usingApiClient,
  handleErrors,
  modelComparison,
};
