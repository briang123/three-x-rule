import {
  apiClient,
  ApiResponse,
  ModelInfo,
  ModelsResponse,
  ConversationInfo,
  AdvancedChatRequest,
  AdvancedChatResponse,
} from './api-client';
import { ChatRequest, GeminiModel } from './gemini';

describe('ApiClient Helper Methods', () => {
  describe('createChatRequest', () => {
    it('should create basic chat request', () => {
      const result = apiClient.createChatRequest('Hello', 'gemini-2.0-flash');

      expect(result).toEqual({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        temperature: 0.7,
      });
    });

    it('should create chat request with context', () => {
      const context = {
        text: 'This is about AI',
        systemPrompt: 'You are a helpful assistant',
      };

      const result = apiClient.createChatRequest('Hello', 'gemini-2.0-flash', context);

      expect(result).toEqual({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        context,
        temperature: 0.7,
      });
    });

    it('should create chat request with custom options', () => {
      const options = {
        temperature: 0.5,
        maxTokens: 1000,
        topP: 0.9,
        topK: 20,
      };

      const result = apiClient.createChatRequest('Hello', 'gemini-2.0-flash', undefined, options);

      expect(result).toEqual({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        temperature: 0.5,
        maxTokens: 1000,
        topP: 0.9,
        topK: 20,
      });
    });
  });

  describe('createAdvancedChatRequest', () => {
    it('should create advanced chat request', () => {
      const result = apiClient.createAdvancedChatRequest('Hello', 'gemini-2.0-flash');

      expect(result).toEqual({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        temperature: 0.7,
      });
    });

    it('should create advanced chat request with conversation ID and streaming', () => {
      const options = {
        conversationId: 'conv-123',
        stream: true,
        temperature: 0.5,
      };

      const result = apiClient.createAdvancedChatRequest(
        'Hello',
        'gemini-2.0-flash',
        undefined,
        options,
      );

      expect(result).toEqual({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        conversationId: 'conv-123',
        temperature: 0.5,
        stream: true,
      });
    });
  });

  describe('createChatRequestWithHistory', () => {
    it('should create chat request with message history', () => {
      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
        { role: 'user' as const, content: 'How are you?' },
      ];

      const result = apiClient.createChatRequestWithHistory(messages, 'gemini-2.0-flash');

      expect(result).toEqual({
        messages,
        model: 'gemini-2.0-flash',
        temperature: 0.7,
      });
    });
  });

  describe('createAdvancedChatRequestWithHistory', () => {
    it('should create advanced chat request with message history', () => {
      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
      ];

      const options = {
        conversationId: 'conv-123',
        stream: false,
      };

      const result = apiClient.createAdvancedChatRequestWithHistory(
        messages,
        'gemini-2.0-flash',
        undefined,
        options,
      );

      expect(result).toEqual({
        messages,
        model: 'gemini-2.0-flash',
        conversationId: 'conv-123',
        temperature: 0.7,
        stream: false,
      });
    });
  });

  describe('Type Definitions', () => {
    it('should have correct ApiResponse structure', () => {
      const response: ApiResponse<string> = {
        success: true,
        data: 'test data',
        timestamp: '2023-01-01T00:00:00Z',
      };

      expect(response.success).toBe(true);
      expect(response.data).toBe('test data');
      expect(response.timestamp).toBe('2023-01-01T00:00:00Z');
    });

    it('should have correct ModelInfo structure', () => {
      const modelInfo: ModelInfo = {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Fast and efficient model',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      };

      expect(modelInfo.id).toBe('gemini-2.0-flash');
      expect(modelInfo.name).toBe('Gemini 2.0 Flash');
      expect(modelInfo.maxInputTokens).toBe(1048576);
      expect(modelInfo.supportsImages).toBe(true);
    });

    it('should have correct ModelsResponse structure', () => {
      const modelsResponse: ModelsResponse = {
        models: [
          {
            id: 'gemini-2.0-flash',
            name: 'Gemini 2.0 Flash',
            description: 'Fast and efficient model',
            maxInputTokens: 1048576,
            maxOutputTokens: 8192,
            supportsImages: true,
            supportsVideo: true,
            supportsAudio: true,
          },
        ],
        totalModels: 1,
        timestamp: '2023-01-01T00:00:00Z',
      };

      expect(modelsResponse.models).toHaveLength(1);
      expect(modelsResponse.totalModels).toBe(1);
      expect(modelsResponse.timestamp).toBe('2023-01-01T00:00:00Z');
    });

    it('should have correct ConversationInfo structure', () => {
      const conversationInfo: ConversationInfo = {
        conversationId: 'conv-123',
        context: { topic: 'AI discussion' },
        lastMessage: 'Hello',
        lastResponse: 'Hi there!',
        timestamp: '2023-01-01T00:00:00Z',
        messageCount: 10,
      };

      expect(conversationInfo.conversationId).toBe('conv-123');
      expect(conversationInfo.messageCount).toBe(10);
      expect(conversationInfo.context).toEqual({ topic: 'AI discussion' });
    });

    it('should have correct AdvancedChatResponse structure', () => {
      const advancedResponse: AdvancedChatResponse = {
        content: 'Advanced response',
        model: 'gemini-2.0-flash',
        usage: { promptTokens: 10, responseTokens: 20, totalTokens: 30 },
        finishReason: 'STOP',
        conversationId: 'conv-123',
        messageCount: 5,
      };

      expect(advancedResponse.content).toBe('Advanced response');
      expect(advancedResponse.conversationId).toBe('conv-123');
      expect(advancedResponse.messageCount).toBe(5);
    });
  });

  describe('Request Validation', () => {
    it('should create valid ChatRequest with all required fields', () => {
      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        temperature: 0.7,
      };

      expect(request.messages).toHaveLength(1);
      expect(request.messages[0].role).toBe('user');
      expect(request.messages[0].content).toBe('Hello');
      expect(request.model).toBe('gemini-2.0-flash');
      expect(request.temperature).toBe(0.7);
    });

    it('should create valid AdvancedChatRequest with all required fields', () => {
      const request: AdvancedChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        conversationId: 'conv-123',
        stream: true,
      };

      expect(request.messages).toHaveLength(1);
      expect(request.model).toBe('gemini-2.0-flash');
      expect(request.temperature).toBe(0.7);
      expect(request.conversationId).toBe('conv-123');
      expect(request.stream).toBe(true);
    });
  });
});
