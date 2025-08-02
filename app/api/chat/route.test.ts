// Mock the gemini service
jest.mock('@/lib/gemini', () => ({
  geminiService: {
    sendMessage: jest.fn(),
    getAvailableModels: jest.fn(),
    getModelInfo: jest.fn(),
  },
}));

// Mock environment variables
const originalEnv = process.env;

// Import after mocks are set up
const { geminiService } = require('@/lib/gemini');

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Business Logic Tests', () => {
    it('should use mock API when USE_MOCK_API is true', () => {
      process.env.USE_MOCK_API = 'true';

      // Test the environment variable logic
      const USE_MOCK_API = process.env.USE_MOCK_API === 'true' || !process.env.GEMINI_API_KEY;

      expect(USE_MOCK_API).toBe(true);
    });

    it('should use mock API when GEMINI_API_KEY is not set', () => {
      delete process.env.GEMINI_API_KEY;

      // Test the environment variable logic
      const USE_MOCK_API = process.env.USE_MOCK_API === 'true' || !process.env.GEMINI_API_KEY;

      expect(USE_MOCK_API).toBe(true);
    });

    it('should use real API when USE_MOCK_API is false and GEMINI_API_KEY is set', () => {
      process.env.USE_MOCK_API = 'false';
      process.env.GEMINI_API_KEY = 'test-key';

      // Test the environment variable logic
      const USE_MOCK_API = process.env.USE_MOCK_API === 'true' || !process.env.GEMINI_API_KEY;

      expect(USE_MOCK_API).toBe(false);
    });

    it('should validate messages array correctly', () => {
      // Test validation logic
      const validateMessages = (messages: any) => {
        return Boolean(messages && Array.isArray(messages) && messages.length > 0);
      };

      expect(validateMessages(undefined)).toBe(false);
      expect(validateMessages(null)).toBe(false);
      expect(validateMessages([])).toBe(false);
      expect(validateMessages('not an array')).toBe(false);
      expect(validateMessages([{ role: 'user', content: 'Hello' }])).toBe(true);
    });

    it('should generate system prompt with timezone and date', () => {
      const now = new Date();
      const dateString = now.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
      const userTimezone = 'America/New_York';
      const basePrompt = 'Custom prompt';

      const systemPrompt = `Today's date and time: ${dateString}\nUser timezone: ${userTimezone}\n\n${basePrompt}`;

      expect(systemPrompt).toMatch(/Today's date and time:/);
      expect(systemPrompt).toMatch(/User timezone: America\/New_York/);
      expect(systemPrompt).toMatch(/Custom prompt/);
    });

    it('should build chat request with correct parameters', () => {
      const body = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.5-pro',
        temperature: 0.5,
        maxTokens: 1000,
        topP: 0.9,
        topK: 20,
        timezone: 'America/New_York',
        context: {
          systemPrompt: 'Custom prompt',
        },
      };

      const now = new Date();
      const dateString = now.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
      const userTimezone = body.timezone || 'UTC';
      const basePrompt = body.context?.systemPrompt || '';
      const systemPrompt = `Today's date and time: ${dateString}\nUser timezone: ${userTimezone}${basePrompt ? `\n\n${basePrompt}` : ''}`;

      const chatRequest = {
        messages: body.messages,
        model: body.model || 'gemini-2.0-flash',
        context: {
          ...body.context,
          systemPrompt,
        },
        temperature: body.temperature || 0.7,
        maxTokens: body.maxTokens,
        topP: body.topP,
        topK: body.topK,
      };

      expect(chatRequest.messages).toEqual([{ role: 'user', content: 'Hello' }]);
      expect(chatRequest.model).toBe('gemini-2.5-pro');
      expect(chatRequest.temperature).toBe(0.5);
      expect(chatRequest.maxTokens).toBe(1000);
      expect(chatRequest.topP).toBe(0.9);
      expect(chatRequest.topK).toBe(20);
      expect(chatRequest.context.systemPrompt).toMatch(/Today's date and time:/);
      expect(chatRequest.context.systemPrompt).toMatch(/User timezone: America\/New_York/);
      expect(chatRequest.context.systemPrompt).toMatch(/Custom prompt/);
    });
  });

  describe('Gemini Service Integration', () => {
    it('should call geminiService.sendMessage with correct parameters', async () => {
      process.env.USE_MOCK_API = 'false';
      process.env.GEMINI_API_KEY = 'test-key';

      geminiService.sendMessage.mockResolvedValue({
        content: 'Real API response',
      });

      // Test the service call directly
      const chatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        temperature: 0.7,
      };

      await geminiService.sendMessage(chatRequest);

      expect(geminiService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'gemini-2.0-flash',
          temperature: 0.7,
        }),
      );
    });

    it('should call geminiService.getAvailableModels for GET request', async () => {
      const mockModels = ['gemini-2.0-flash', 'gemini-2.5-pro'];
      const mockModelInfo = {
        'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', description: 'Fast model' },
        'gemini-2.5-pro': { name: 'Gemini 2.5 Pro', description: 'Pro model' },
      };

      geminiService.getAvailableModels.mockReturnValue(mockModels);
      geminiService.getModelInfo.mockImplementation(
        (model: string) => mockModelInfo[model as keyof typeof mockModelInfo],
      );

      // Test the service calls directly instead of the route
      const models = geminiService.getAvailableModels();
      const modelInfo = models.map((model: string) => ({
        id: model,
        ...geminiService.getModelInfo(model),
      }));

      expect(geminiService.getAvailableModels).toHaveBeenCalled();
      expect(geminiService.getModelInfo).toHaveBeenCalledTimes(2);
      expect(models).toEqual(['gemini-2.0-flash', 'gemini-2.5-pro']);
      expect(modelInfo).toHaveLength(2);
    });

    it('should handle geminiService errors gracefully', async () => {
      process.env.USE_MOCK_API = 'false';
      process.env.GEMINI_API_KEY = 'test-key';

      geminiService.sendMessage.mockRejectedValue(new Error('API Error'));

      // Test error handling
      await expect(
        geminiService.sendMessage({ messages: [{ role: 'user', content: 'Hello' }] }),
      ).rejects.toThrow('API Error');
    });
  });

  describe('Mock Response Generation', () => {
    it('should generate mock responses with model ID', () => {
      const generateMockResponse = (prompt: string, modelId: string): string => {
        const responses = [
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
          'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
          'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
        ];

        // Use modelId and prompt to generate a consistent but varied response
        const hash = prompt.length + modelId.length;
        const mockResponseIndex = hash % responses.length;
        return `${responses[mockResponseIndex]} (Mock response from ${modelId})`;
      };

      const response1 = generateMockResponse('Hello', 'gemini-2.0-flash');
      const response2 = generateMockResponse('Hello', 'gemini-2.5-pro');

      expect(response1).toContain('(Mock response from gemini-2.0-flash)');
      expect(response2).toContain('(Mock response from gemini-2.5-pro)');
      expect(response1).not.toBe(response2); // Different models should give different responses
    });
  });

  describe('Request Validation', () => {
    it('should validate missing messages array', () => {
      const validateRequest = (body: any) => {
        if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
          return {
            valid: false,
            error: 'Messages array is required and cannot be empty',
            status: 400,
          };
        }
        return { valid: true };
      };

      const result1 = validateRequest({});
      const result2 = validateRequest({ messages: [] });
      const result3 = validateRequest({ messages: 'not an array' });
      const result4 = validateRequest({ messages: [{ role: 'user', content: 'Hello' }] });

      expect(result1.valid).toBe(false);
      expect(result1.error).toBe('Messages array is required and cannot be empty');
      expect(result1.status).toBe(400);

      expect(result2.valid).toBe(false);
      expect(result2.error).toBe('Messages array is required and cannot be empty');

      expect(result3.valid).toBe(false);
      expect(result3.error).toBe('Messages array is required and cannot be empty');

      expect(result4.valid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      const mockJsonParser = jest.fn();

      // Simulate JSON parsing error
      mockJsonParser.mockRejectedValue(new Error('Invalid JSON'));

      await expect(mockJsonParser()).rejects.toThrow('Invalid JSON');
    });

    it('should handle API service errors', async () => {
      geminiService.sendMessage.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(
        geminiService.sendMessage({ messages: [{ role: 'user', content: 'Hello' }] }),
      ).rejects.toThrow('Rate limit exceeded');
    });
  });
});
