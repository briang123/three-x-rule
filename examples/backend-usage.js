// Backend Service Usage Examples
// This file demonstrates how to use the Gemini backend service with various features

// Example 1: Basic text message
async function basicTextMessage() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'Hello, how are you today?',
        },
      ],
      model: 'gemini-2.0-flash',
      temperature: 0.7,
    }),
  });

  const result = await response.json();
  console.log('Basic response:', result);
}

// Example 2: Message with context
async function messageWithContext() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'What is the capital of France?',
        },
      ],
      model: 'gemini-2.0-flash',
      context: {
        text: 'You are a helpful geography assistant. Always provide accurate information about countries and their capitals.',
        systemPrompt:
          'You are a knowledgeable geography expert. Provide detailed and accurate information.',
      },
      temperature: 0.3,
    }),
  });

  const result = await response.json();
  console.log('Context response:', result);
}

// Example 3: Conversation with history
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
          content: 'My name is Alice.',
        },
        {
          role: 'assistant',
          content: 'Hello Alice! Nice to meet you. How can I help you today?',
        },
        {
          role: 'user',
          content: 'What did I just tell you my name was?',
        },
      ],
      model: 'gemini-2.0-flash',
      temperature: 0.7,
    }),
  });

  const result = await response.json();
  console.log('Conversation response:', result);
}

// Example 4: Advanced chat with conversation management
async function advancedChatWithConversation() {
  // First message - creates a new conversation
  const response1 = await fetch('/api/chat/advanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'I want to learn about machine learning.',
        },
      ],
      model: 'gemini-2.0-flash',
      context: {
        systemPrompt: 'You are a patient and knowledgeable machine learning tutor.',
      },
      temperature: 0.7,
    }),
  });

  const result1 = await response1.json();
  console.log('First message:', result1);

  // Second message - continues the same conversation
  const conversationId = result1.data.conversationId;
  const response2 = await fetch('/api/chat/advanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'What are the main types of machine learning?',
        },
      ],
      model: 'gemini-2.0-flash',
      conversationId: conversationId,
      temperature: 0.7,
    }),
  });

  const result2 = await response2.json();
  console.log('Second message:', result2);

  // Get conversation history
  const historyResponse = await fetch(`/api/chat/advanced?conversationId=${conversationId}`, {
    method: 'GET',
  });

  const history = await historyResponse.json();
  console.log('Conversation history:', history);
}

// Example 5: Streaming response
async function streamingResponse() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'Write a short story about a robot learning to paint.',
        },
      ],
      model: 'gemini-2.0-flash',
      stream: true,
      temperature: 0.8,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          console.log('Stream chunk:', data);
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

// Example 6: Message with images
async function messageWithImages() {
  // Convert image to base64 (this is just an example)
  const imageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'; // Your base64 image data

  const response = await fetch('/api/chat/with-images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'What do you see in this image?',
        },
      ],
      model: 'gemini-2.0-flash',
      context: {
        images: [imageBase64],
        systemPrompt: 'You are an image analysis expert. Describe what you see in detail.',
      },
      temperature: 0.3,
    }),
  });

  const result = await response.json();
  console.log('Image analysis response:', result);
}

// Example 7: Using different models
async function differentModels() {
  const models = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  for (const model of models) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Explain quantum computing in simple terms.',
          },
        ],
        model: model,
        temperature: 0.7,
        maxTokens: 500,
      }),
    });

    const result = await response.json();
    console.log(`${model} response:`, result);
  }
}

// Example 8: Get available models
async function getAvailableModels() {
  const response = await fetch('/api/chat', {
    method: 'GET',
  });

  const result = await response.json();
  console.log('Available models:', result);
}

// Example 9: Error handling
async function errorHandling() {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing required messages field
        model: 'gemini-2.0-flash',
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error('API Error:', result.error);
    } else {
      console.log('Success:', result);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Example 10: Using the API client (if available in frontend)
async function usingApiClient() {
  // This would be used in a frontend environment
  // import { apiClient } from '@/lib/api-client';

  // Basic message
  const basicRequest = apiClient.createChatRequest(
    'Hello, how are you?',
    'gemini-2.0-flash',
    {
      systemPrompt: 'You are a friendly assistant.',
    },
    {
      temperature: 0.7,
      maxTokens: 100,
    },
  );

  const basicResponse = await apiClient.sendMessage(basicRequest);
  console.log('Basic client response:', basicResponse);

  // Advanced message with conversation
  const advancedRequest = apiClient.createAdvancedChatRequest(
    'Tell me a joke',
    'gemini-2.0-flash',
    {
      systemPrompt: 'You are a comedian. Make jokes that are family-friendly.',
    },
    {
      conversationId: 'my-conversation-123',
      temperature: 0.8,
      stream: false,
    },
  );

  const advancedResponse = await apiClient.sendAdvancedMessage(advancedRequest);
  console.log('Advanced client response:', advancedResponse);
}

// Export all examples for use
export {
  basicTextMessage,
  messageWithContext,
  conversationWithHistory,
  advancedChatWithConversation,
  streamingResponse,
  messageWithImages,
  differentModels,
  getAvailableModels,
  errorHandling,
  usingApiClient,
};

// Usage instructions:
/*
To use these examples:

1. Make sure your environment variables are set:
   - GEMINI_API_KEY=your_gemini_api_key_here

2. Run the examples:
   - For Node.js: node examples/backend-usage.js
   - For browser: Import and call the functions
   - For testing: Use in your frontend components

3. API Endpoints available:
   - POST /api/chat - Basic chat with text
   - POST /api/chat/with-images - Chat with images
   - POST /api/chat/advanced - Advanced chat with conversation management
   - GET /api/chat - Get available models
   - GET /api/chat/advanced?conversationId=xxx - Get conversation history
   - DELETE /api/chat/advanced?conversationId=xxx - Delete conversation

4. Features supported:
   - Multiple Gemini models
   - Context and system prompts
   - Conversation history
   - Image analysis
   - Streaming responses
   - Temperature and other generation parameters
   - Error handling and validation
*/
