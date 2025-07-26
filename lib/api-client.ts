import { ChatRequest, ChatResponse, GeminiModel } from './gemini';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  supportsImages: boolean;
  supportsVideo: boolean;
  supportsAudio: boolean;
}

export interface ModelsResponse {
  models: ModelInfo[];
  totalModels: number;
  timestamp: string;
}

export interface ConversationInfo {
  conversationId: string;
  context: any;
  lastMessage: any;
  lastResponse: any;
  timestamp: string;
  messageCount: number;
}

export interface AdvancedChatRequest extends ChatRequest {
  conversationId?: string;
  stream?: boolean;
}

export interface AdvancedChatResponse extends ChatResponse {
  conversationId: string;
  messageCount: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Send a text message to Gemini (basic)
  async sendMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.makeRequest<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Send a message with streaming support
  async sendMessageStream(
    request: AdvancedChatRequest,
  ): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const url = `${this.baseUrl}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.error('Streaming request failed:', error);
      return null;
    }
  }

  // Send a message with images to Gemini
  async sendMessageWithImages(
    request: Omit<ChatRequest, 'context'> & {
      context: {
        text?: string;
        images: string[]; // Base64 encoded images
        systemPrompt?: string;
      };
    },
  ): Promise<ApiResponse<ChatResponse>> {
    return this.makeRequest<ChatResponse>('/api/chat/with-images', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Send a message with file attachments
  async sendMessageWithAttachments(
    prompt: string,
    model: string,
    files: File[],
  ): Promise<ApiResponse<ChatResponse>> {
    try {
      console.log(
        'API Client: Creating request with prompt:',
        prompt,
        'model:',
        model,
        'files:',
        files.length,
      );

      // For now, let's use the regular chat endpoint since the with-attachments endpoint might not be working
      // We'll create a simple chat request instead
      const chatRequest = {
        messages: [
          {
            role: 'user' as const,
            content: prompt,
          },
        ],
        model: model,
        temperature: 0.7,
      };

      console.log('API Client: Using regular chat endpoint with request:', chatRequest);

      const url = `${this.baseUrl}/api/chat`;
      console.log('API Client: Making request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest),
      });

      console.log('API Client: Response status:', response.status);
      console.log('API Client: Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('API Client: Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request with attachments failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Advanced chat with conversation management
  async sendAdvancedMessage(
    request: AdvancedChatRequest,
  ): Promise<ApiResponse<AdvancedChatResponse>> {
    return this.makeRequest<AdvancedChatResponse>('/api/chat/advanced', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get conversation history
  async getConversation(conversationId: string): Promise<ApiResponse<ConversationInfo>> {
    return this.makeRequest<ConversationInfo>(
      `/api/chat/advanced?conversationId=${conversationId}`,
      {
        method: 'GET',
      },
    );
  }

  // Delete conversation
  async deleteConversation(
    conversationId: string,
  ): Promise<ApiResponse<{ deleted: boolean; conversationId: string }>> {
    return this.makeRequest<{ deleted: boolean; conversationId: string }>(
      `/api/chat/advanced?conversationId=${conversationId}`,
      {
        method: 'DELETE',
      },
    );
  }

  // Get available models
  async getModels(): Promise<ApiResponse<ModelsResponse>> {
    return this.makeRequest<ModelsResponse>('/api/chat', {
      method: 'GET',
    });
  }

  // Helper method to create a simple chat request
  createChatRequest(
    message: string,
    model: GeminiModel = 'gemini-2.0-flash',
    context?: {
      text?: string;
      systemPrompt?: string;
    },
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      topK?: number;
    },
  ): ChatRequest {
    return {
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      model,
      context,
      temperature: options?.temperature || 0.7,
      maxTokens: options?.maxTokens,
      topP: options?.topP,
      topK: options?.topK,
    };
  }

  // Helper method to create an advanced chat request with conversation management
  createAdvancedChatRequest(
    message: string,
    model: GeminiModel = 'gemini-2.0-flash',
    context?: {
      text?: string;
      systemPrompt?: string;
    },
    options?: {
      conversationId?: string;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      topK?: number;
      stream?: boolean;
    },
  ): AdvancedChatRequest {
    return {
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      model,
      context,
      conversationId: options?.conversationId,
      temperature: options?.temperature || 0.7,
      maxTokens: options?.maxTokens,
      topP: options?.topP,
      topK: options?.topK,
      stream: options?.stream,
    };
  }

  // Helper method to create a chat request with conversation history
  createChatRequestWithHistory(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    model: GeminiModel = 'gemini-2.0-flash',
    context?: {
      text?: string;
      systemPrompt?: string;
    },
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      topK?: number;
    },
  ): ChatRequest {
    return {
      messages,
      model,
      context,
      temperature: options?.temperature || 0.7,
      maxTokens: options?.maxTokens,
      topP: options?.topP,
      topK: options?.topK,
    };
  }

  // Helper method to create an advanced chat request with history and conversation management
  createAdvancedChatRequestWithHistory(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    model: GeminiModel = 'gemini-2.0-flash',
    context?: {
      text?: string;
      systemPrompt?: string;
    },
    options?: {
      conversationId?: string;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      topK?: number;
      stream?: boolean;
    },
  ): AdvancedChatRequest {
    return {
      messages,
      model,
      context,
      conversationId: options?.conversationId,
      temperature: options?.temperature || 0.7,
      maxTokens: options?.maxTokens,
      topP: options?.topP,
      topK: options?.topK,
      stream: options?.stream,
    };
  }

  // Utility method to process streaming response
  async processStreamResponse(
    stream: ReadableStream<Uint8Array> | null,
    onChunk?: (chunk: any) => void,
    onComplete?: (data: any) => void,
    onError?: (error: string) => void,
  ): Promise<void> {
    if (!stream) {
      onError?.('Failed to create stream');
      return;
    }

    try {
      const reader = stream.getReader();
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
              onChunk?.(data);

              if (data.success === false) {
                onError?.(data.error || 'Stream error');
                return;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      onComplete?.({ success: true });
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Stream processing error');
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
