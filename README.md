# Three-X-Rule

A modern web application for exploring and implementing the 3X Rule methodology with AI assistance powered by Google's Gemini API.

## Features

- **AI-Powered Chat Interface**: Interact with Google's Gemini models for intelligent responses
- **Multiple Model Support**: Choose from various Gemini models (2.5 Pro, 2.5 Flash, 2.0 Flash, etc.)
- **Per-Column Model Selection**: Select different models for each of the three output columns to compare responses
- **Context Management**: Add system prompts and additional context to enhance AI responses
- **Modern UI**: Beautiful, responsive interface built with Next.js, React, and Tailwind CSS
- **Real-time Interactions**: Smooth animations and real-time feedback

## Gemini API Integration

This application includes a comprehensive backend service for interacting with Google's Gemini API:

### Supported Models

- **Gemini 2.5 Pro**: Most powerful thinking model with maximum response accuracy
- **Gemini 2.5 Flash**: Best price-performance model with well-rounded capabilities
- **Gemini 2.5 Flash Lite**: Most cost-efficient model supporting high throughput
- **Gemini 2.0 Flash**: Next generation features, speed, and realtime streaming
- **Gemini 2.0 Flash Lite**: Cost efficiency and low latency
- **Gemini 1.5 Pro**: Long context window and multimodal capabilities
- **Gemini 1.5 Flash**: Fast and efficient model

### Features

- **Text Chat**: Send text messages with optional context
- **Image Analysis**: Upload images for AI analysis (supported models only)
- **System Prompts**: Define AI behavior and response style
- **Context Management**: Add background information and reference material
- **Model Selection**: Choose the best model for your use case
- **Token Usage Tracking**: Monitor API usage and costs

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd three-x-rule
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

4. Add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

5. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## API Usage

### Backend API Endpoints

#### POST `/api/chat`

Send a text message to Gemini with optional context.

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain the 3X Rule methodology"
    }
  ],
  "model": "gemini-2.0-flash",
  "context": {
    "systemPrompt": "You are an expert in productivity methodologies.",
    "text": "The 3X Rule is a productivity framework..."
  },
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "content": "The 3X Rule methodology is...",
    "model": "gemini-2.0-flash",
    "usage": {
      "promptTokens": 150,
      "responseTokens": 300,
      "totalTokens": 450
    },
    "finishReason": "STOP"
  }
}
```

#### POST `/api/chat/with-images`

Send a message with images for analysis.

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Analyze this image"
    }
  ],
  "model": "gemini-2.0-flash",
  "context": {
    "images": ["base64_encoded_image_data"],
    "systemPrompt": "You are an expert image analyst."
  }
}
```

#### GET `/api/chat`

Get available Gemini models and their capabilities.

**Response:**

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "gemini-2.5-pro",
        "name": "Gemini 2.5 Pro",
        "description": "Most powerful thinking model...",
        "maxInputTokens": 2097152,
        "maxOutputTokens": 8192,
        "supportsImages": true,
        "supportsVideo": true,
        "supportsAudio": true
      }
    ]
  }
}
```

### Frontend API Client

The application includes a client-side API utility for easy integration:

```typescript
import { apiClient } from '@/lib/api-client';

// Simple message
const response = await apiClient.sendMessage(
  apiClient.createChatRequest('Explain the 3X Rule', 'gemini-2.0-flash', {
    systemPrompt: 'You are a productivity expert',
  }),
);

// Message with conversation history
const response = await apiClient.sendMessage(
  apiClient.createChatRequestWithHistory(
    [
      { role: 'user', content: 'What is the 3X Rule?' },
      { role: 'assistant', content: 'The 3X Rule is...' },
      { role: 'user', content: 'How do I implement it?' },
    ],
    'gemini-2.0-flash',
  ),
);
```

## Components

### ModelSelector

A component for selecting different Gemini models with detailed information about capabilities and token limits.

### OutputColumns

Displays three columns of AI responses with individual model selectors for each column. Users can choose different models for each column to compare how different AI models respond to the same prompt.

### ContextPanel

A component for managing additional context including system prompts and reference text.

### ChatInput

Enhanced chat input with support for context-aware messaging.

## Environment Variables

| Variable                   | Description                         | Required |
| -------------------------- | ----------------------------------- | -------- |
| `GEMINI_API_KEY`           | Your Google Gemini API key          | Yes      |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for API calls (production) | No       |

## Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: Input validation using Zod schemas
- **API Errors**: Proper error responses with meaningful messages
- **Rate Limiting**: Graceful handling of API rate limits
- **Network Errors**: Fallback handling for network issues

## Security

- API keys are stored server-side only
- Input validation and sanitization
- Rate limiting support
- Secure environment variable handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

- Check the [Gemini API documentation](https://ai.google.dev/gemini-api/docs)
- Review the [Google AI Studio](https://makersuite.google.com/) for API key management
- Open an issue in this repository
