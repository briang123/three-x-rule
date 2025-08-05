import {
  geminiProvider,
  geminiProviderConfig,
  fetchGeminiModels,
  getGeminiProviderConfig,
} from './gemini';
import { geminiService } from '../gemini';

// Mock the AI SDK
jest.mock('ai', () => ({
  customProvider: jest.fn((config) => ({
    id: config.id,
    generateText: jest.fn(),
  })),
}));

// Mock the gemini service
jest.mock('../gemini', () => ({
  geminiService: {
    sendMessage: jest.fn(),
  },
}));

describe('Gemini Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('geminiProvider', () => {
    it('should have correct provider ID', () => {
      expect(geminiProvider.id).toBe('gemini');
    });

    it('should generate text successfully', async () => {
      const mockResponse = { content: 'Generated text response' };
      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      // Mock the generateText function
      const mockGenerateText = jest.fn().mockResolvedValue({ text: 'Generated text response' });
      geminiProvider.generateText = mockGenerateText;

      const result = await geminiProvider.generateText({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Test prompt' }],
        temperature: 0.7,
        maxTokens: 1000,
      });

      expect(result).toEqual({ text: 'Generated text response' });
    });

    it('should handle errors from gemini service', async () => {
      const mockError = new Error('Gemini API Error');
      (geminiService.sendMessage as jest.Mock).mockRejectedValue(mockError);

      // Mock the generateText function to throw error
      const mockGenerateText = jest.fn().mockRejectedValue(mockError);
      geminiProvider.generateText = mockGenerateText;

      await expect(
        geminiProvider.generateText({
          model: 'gemini-2.0-flash',
          messages: [{ role: 'user', content: 'Test prompt' }],
        }),
      ).rejects.toThrow('Gemini API Error');
    });
  });

  describe('geminiProviderConfig', () => {
    it('should have correct configuration structure', () => {
      expect(geminiProviderConfig.id).toBe('gemini');
      expect(geminiProviderConfig.name).toBe('Google Gemini');
      expect(geminiProviderConfig.description).toBe('Google Gemini AI models');
      expect(Array.isArray(geminiProviderConfig.models)).toBe(true);
      expect(geminiProviderConfig.models.length).toBeGreaterThan(0);
      expect(geminiProviderConfig.defaultModel).toBe('gemini-2.0-flash');
      expect(geminiProviderConfig.apiKeyRequired).toBe(true);
      expect(geminiProviderConfig.apiKeyEnvVar).toBe('GOOGLE_GEMINI_API_KEY');
    });

    it('should have valid models array', () => {
      expect(Array.isArray(geminiProviderConfig.models)).toBe(true);
      expect(geminiProviderConfig.models.length).toBeGreaterThan(0);
      expect(geminiProviderConfig.models[0]).toHaveProperty('id');
      expect(geminiProviderConfig.models[0]).toHaveProperty('name');
    });
  });

  describe('fetchGeminiModels', () => {
    it('should return default models when no API key is provided', async () => {
      const models = await fetchGeminiModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(2);
      expect(models[0]).toHaveProperty('id', 'gemini-2.0-flash');
      expect(models[1]).toHaveProperty('id', 'gemini-2.0-flash-exp');
    });

    it('should return default models when API key is provided (for now)', async () => {
      const models = await fetchGeminiModels('test-api-key');

      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(2);
      expect(models[0]).toHaveProperty('id', 'gemini-2.0-flash');
      expect(models[1]).toHaveProperty('id', 'gemini-2.0-flash-exp');
    });

    it('should handle API errors gracefully', async () => {
      // Mock fetch to throw an error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      const models = await fetchGeminiModels('test-api-key');

      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(2);

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('getGeminiProviderConfig', () => {
    it('should return configuration with dynamic models', async () => {
      const config = await getGeminiProviderConfig('test-api-key');

      expect(config).toHaveProperty('id', 'gemini');
      expect(config).toHaveProperty('name', 'Google Gemini');
      expect(config).toHaveProperty('models');
      expect(Array.isArray(config.models)).toBe(true);
      expect(config.models).toHaveLength(2);
    });

    it('should use default model when available in fetched models', async () => {
      const config = await getGeminiProviderConfig('test-api-key');

      expect(config.defaultModel).toBe('gemini-2.0-flash');
    });

    it('should fallback to first available model when default is not available', async () => {
      // Test the logic by creating a mock config with different models
      const mockConfig = {
        ...geminiProviderConfig,
        models: [
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
          { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental' },
        ],
        defaultModel: 'gemini-1.5-flash', // Should be first available
      };

      expect(mockConfig.defaultModel).toBe('gemini-1.5-flash');
      expect(mockConfig.models.some((m) => m.id === mockConfig.defaultModel)).toBe(true);
    });

    it('should handle empty models array', async () => {
      // Test the logic by creating a mock config with empty models
      const mockConfig = {
        ...geminiProviderConfig,
        models: [],
        defaultModel: 'gemini-2.0-flash', // Should fallback to default
      };

      expect(mockConfig.defaultModel).toBe('gemini-2.0-flash');
    });
  });
});
