import { AISDKService } from './ai-sdk-service';
import { generateText, generateObject, streamText, streamObject } from 'ai';
import { getProviderConfigWithModels } from './providers';
import { z } from 'zod';

// Mock the AI SDK functions
jest.mock('ai', () => ({
  generateText: jest.fn(),
  generateObject: jest.fn(),
  streamText: jest.fn(),
  streamObject: jest.fn(),
  AISDKError: class AISDKError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AISDKError';
    }
  },
  APICallError: class APICallError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'APICallError';
    }
  },
}));

// Mock the providers module
jest.mock('./providers', () => ({
  getProviderConfigWithModels: jest.fn(),
}));

// Mock the schemas
jest.mock('./schemas', () => ({
  RemixResponseSchema: {},
  SocialPostSchema: {},
  ContentEnhancementSchema: {},
}));

describe('AISDKService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock for getProviderConfigWithModels
    (getProviderConfigWithModels as jest.Mock).mockResolvedValue({
      models: [{ id: 'gemini-2.0-flash' }, { id: 'gemini-2.0-flash-exp' }],
    });
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const mockResponse = { text: 'Generated response' };
      (generateText as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AISDKService.generateText('Test prompt', 'gemini-2.0-flash');

      expect(result).toEqual(mockResponse);
      expect(generateText).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Test prompt' }],
        temperature: 0.7,
        maxRetries: 3,
      });
    });

    it('should handle custom options', async () => {
      const mockResponse = { text: 'Generated response' };
      (generateText as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AISDKService.generateText('Test prompt', 'gemini-2.0-flash', {
        temperature: 0.5,
        maxRetries: 5,
      });

      expect(result).toEqual(mockResponse);
      expect(generateText).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Test prompt' }],
        temperature: 0.5,
        maxRetries: 5,
      });
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      (generateText as jest.Mock).mockRejectedValue(apiError);

      await expect(AISDKService.generateText('Test prompt', 'gemini-2.0-flash')).rejects.toThrow(
        'API Error',
      );
    });
  });

  describe('generateStructuredRemix', () => {
    it('should generate structured remix successfully', async () => {
      const mockResponse = {
        synthesizedResponse: 'Combined response',
        confidence: 0.9,
        reasoning: 'Based on best parts',
      };
      (generateObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AISDKService.generateStructuredRemix(
        'Original prompt',
        ['Response 1', 'Response 2', 'Response 3'],
        'gemini-2.0-flash',
      );

      expect(result).toEqual(mockResponse);
      expect(generateObject).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        messages: [
          {
            role: 'user',
            content: expect.stringContaining('Original prompt'),
          },
        ],
        schema: {},
        temperature: 0.7,
      });
    });
  });

  describe('multi-modal capabilities', () => {
    it('should generate image successfully', async () => {
      await expect(AISDKService.generateImage('Test prompt')).rejects.toThrow(
        'Image generation not implemented yet',
      );
    });

    it('should generate speech successfully', async () => {
      await expect(AISDKService.generateSpeech('Test text')).rejects.toThrow(
        'Speech generation not implemented yet',
      );
    });

    it('should transcribe audio successfully', async () => {
      const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
      await expect(AISDKService.transcribeAudio(mockFile)).rejects.toThrow(
        'Audio transcription not implemented yet',
      );
    });
  });

  describe('enhanceContent', () => {
    it('should enhance content successfully', async () => {
      const mockResponse = {
        enhancedContent: 'Enhanced content',
        improvements: ['Better structure', 'Clearer language'],
      };
      (generateObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AISDKService.enhanceContent('Original content', 'gemini-2.0-flash');

      expect(result).toEqual(mockResponse);
      expect(generateObject).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        messages: [
          {
            role: 'user',
            content: expect.stringContaining('Enhance this content with better structure'),
          },
        ],
        schema: {},
        temperature: 0.7,
      });
    });
  });

  describe('streamText', () => {
    it('should stream text successfully', async () => {
      const mockStream = { text: 'Streamed response' };
      (streamText as jest.Mock).mockResolvedValue(mockStream);

      const result = await AISDKService.streamText('Test prompt', 'gemini-2.0-flash');

      expect(result).toEqual(mockStream);
      expect(streamText).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Test prompt' }],
        temperature: 0.7,
      });
    });

    it('should handle custom options', async () => {
      const mockStream = { text: 'Streamed response' };
      (streamText as jest.Mock).mockResolvedValue(mockStream);

      const result = await AISDKService.streamText('Test prompt', 'gemini-2.0-flash', {
        temperature: 0.5,
      });

      expect(result).toEqual(mockStream);
      expect(streamText).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Test prompt' }],
        temperature: 0.5,
      });
    });
  });

  describe('streamObject', () => {
    it('should stream object successfully', async () => {
      const mockStream = { object: { key: 'value' } };
      const mockSchema = z.object({ test: z.string() });
      (streamObject as jest.Mock).mockResolvedValue(mockStream);

      const result = await AISDKService.streamObject('Test prompt', 'gemini-2.0-flash', mockSchema);

      expect(result).toEqual(mockStream);
      expect(streamObject).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Test prompt' }],
        schema: mockSchema,
        temperature: 0.7,
      });
    });
  });

  describe('generateSocialPost', () => {
    it('should generate Twitter post successfully', async () => {
      const mockResponse = {
        content: 'Test tweet content',
        characterCount: 20,
        hashtags: ['#test'],
      };
      (generateObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AISDKService.generateSocialPost(
        'Test topic',
        'twitter',
        'gemini-2.0-flash',
      );

      expect(result).toEqual(mockResponse);
      expect(generateObject).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        messages: [
          {
            role: 'user',
            content: expect.stringContaining('Create a twitter post about "Test topic"'),
          },
        ],
        schema: {},
        temperature: 0.7,
      });
    });

    it('should handle custom options', async () => {
      const mockResponse = {
        content: 'Test LinkedIn post',
        characterCount: 50,
        hashtags: ['#test', '#linkedin'],
      };
      (generateObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AISDKService.generateSocialPost(
        'Test topic',
        'linkedin',
        'gemini-2.0-flash',
        {
          tone: 'professional',
          includeHashtags: true,
          maxLength: 300,
        },
      );

      expect(result).toEqual(mockResponse);
      const callArgs = (generateObject as jest.Mock).mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('Tone: professional');
      expect(callArgs.messages[0].content).toContain('Include hashtags: yes');
      expect(callArgs.messages[0].content).toContain('Maximum length: 300 characters');
    });
  });

  describe('getAvailableModels', () => {
    it('should get available models successfully', async () => {
      const mockConfig = {
        models: [{ id: 'gemini-2.0-flash' }, { id: 'gemini-2.0-flash-exp' }],
      };
      (getProviderConfigWithModels as jest.Mock).mockResolvedValue(mockConfig);

      const result = await AISDKService.getAvailableModels('gemini', 'test-api-key');

      expect(result).toEqual([{ id: 'gemini-2.0-flash' }, { id: 'gemini-2.0-flash-exp' }]);
      expect(getProviderConfigWithModels).toHaveBeenCalledWith('gemini', 'test-api-key');
    });
  });

  describe('validateModel', () => {
    it('should validate model successfully', async () => {
      const mockConfig = {
        models: [{ id: 'gemini-2.0-flash' }, { id: 'gemini-2.0-flash-exp' }],
      };
      (getProviderConfigWithModels as jest.Mock).mockResolvedValue(mockConfig);

      const result = await AISDKService.validateModel('gemini', 'gemini-2.0-flash', 'test-api-key');

      expect(result).toBe(true);
    });

    it('should return false for invalid model', async () => {
      const mockConfig = {
        models: [{ id: 'gemini-2.0-flash' }, { id: 'gemini-2.0-flash-exp' }],
      };
      (getProviderConfigWithModels as jest.Mock).mockResolvedValue(mockConfig);

      const result = await AISDKService.validateModel('gemini', 'invalid-model', 'test-api-key');

      expect(result).toBe(false);
    });
  });

  describe('error handling utilities', () => {
    it('should get error message correctly', () => {
      const { AISDKError, APICallError } = require('ai');

      expect(AISDKService.getErrorMessage(new AISDKError('AI SDK Error'))).toBe('AI SDK Error');
      expect(AISDKService.getErrorMessage(new APICallError('API Error'))).toBe('API Error');
      expect(AISDKService.getErrorMessage(new Error('Generic Error'))).toBe(
        'An unknown error occurred',
      );
    });

    it('should identify AI SDK errors correctly', () => {
      const { AISDKError } = require('ai');

      expect(AISDKService.isAISDKError(new AISDKError('Test'))).toBe(true);
      expect(AISDKService.isAISDKError(new Error('Test'))).toBe(false);
    });

    it('should identify API call errors correctly', () => {
      const { APICallError } = require('ai');

      expect(AISDKService.isAPICallError(new APICallError('Test'))).toBe(true);
      expect(AISDKService.isAPICallError(new Error('Test'))).toBe(false);
    });
  });
});
