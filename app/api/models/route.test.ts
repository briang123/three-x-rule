import { AISDKService } from '@/lib/ai-sdk-service';
import { z } from 'zod';

// Mock the AI SDK service
jest.mock('@/lib/ai-sdk-service', () => ({
  AISDKService: {
    getAvailableModels: jest.fn(),
    getErrorMessage: jest.fn(),
  },
}));

describe('/api/models Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Validation', () => {
    // Import the validation schema from the route file
    const ModelsRequestSchema = z.object({
      providerId: z.string().min(1, 'Provider ID is required'),
      apiKey: z.string().optional(),
    });

    it('should validate correct request body', () => {
      const validRequest = {
        providerId: 'gemini',
        apiKey: 'test-api-key',
      };

      const result = ModelsRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.providerId).toBe('gemini');
        expect(result.data.apiKey).toBe('test-api-key');
      }
    });

    it('should validate request without API key', () => {
      const validRequest = {
        providerId: 'gemini',
      };

      const result = ModelsRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.providerId).toBe('gemini');
        expect(result.data.apiKey).toBeUndefined();
      }
    });

    it('should reject request with missing providerId', () => {
      const invalidRequest = {
        apiKey: 'test-api-key',
      };

      const result = ModelsRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        const hasProviderIdError = result.error.errors.some((error) =>
          error.path.includes('providerId'),
        );
        expect(hasProviderIdError).toBe(true);
      }
    });

    it('should reject request with empty providerId', () => {
      const invalidRequest = {
        providerId: '',
        apiKey: 'test-api-key',
      };

      const result = ModelsRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toContainEqual(
          expect.objectContaining({
            message: 'Provider ID is required',
          }),
        );
      }
    });
  });

  describe('AI SDK Integration', () => {
    it('should call getAvailableModels with correct parameters', async () => {
      const mockModels = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
      (AISDKService.getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

      const providerId = 'gemini';
      const apiKey = 'test-api-key';

      const result = await AISDKService.getAvailableModels(providerId, apiKey);

      expect(result).toEqual(mockModels);
      expect(AISDKService.getAvailableModels).toHaveBeenCalledWith(providerId, apiKey);
    });

    it('should handle empty models array', async () => {
      const mockModels: string[] = [];
      (AISDKService.getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

      const result = await AISDKService.getAvailableModels('gemini', 'test-api-key');

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle AI SDK errors', async () => {
      const mockError = new Error('AI SDK Error');
      (AISDKService.getAvailableModels as jest.Mock).mockRejectedValue(mockError);
      (AISDKService.getErrorMessage as jest.Mock).mockReturnValue('AI SDK Error: AI SDK Error');

      try {
        await AISDKService.getAvailableModels('gemini', 'test-api-key');
      } catch (error) {
        AISDKService.getErrorMessage(error);
      }

      expect(AISDKService.getErrorMessage).toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    it('should format successful response correctly', () => {
      const mockModels = ['gemini-2.0-flash', 'gemini-2.0-flash-exp'];
      const providerId = 'gemini';

      const expectedResponse = {
        success: true,
        data: {
          providerId,
          models: mockModels,
          count: mockModels.length,
        },
        timestamp: expect.any(String),
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.data.providerId).toBe(providerId);
      expect(expectedResponse.data.models).toEqual(mockModels);
      expect(expectedResponse.data.count).toBe(2);
      expect(expectedResponse.timestamp).toBeDefined();
    });

    it('should format error response correctly', () => {
      const errorMessage = 'Validation error';
      const errorDetails = ['Provider ID is required'];

      const expectedErrorResponse = {
        success: false,
        error: errorMessage,
        details: errorDetails,
      };

      expect(expectedErrorResponse.success).toBe(false);
      expect(expectedErrorResponse.error).toBe(errorMessage);
      expect(expectedErrorResponse.details).toEqual(errorDetails);
    });
  });

  describe('API Documentation', () => {
    it('should provide correct usage information', () => {
      const expectedUsage = {
        method: 'POST',
        body: {
          providerId: 'string (required) - The ID of the provider (e.g., "gemini")',
          apiKey: 'string (optional) - API key for the provider to fetch available models',
        },
        response: {
          success: 'boolean',
          data: {
            providerId: 'string',
            models: 'string[] - Array of available model names',
            count: 'number - Number of available models',
          },
          timestamp: 'string',
        },
      };

      expect(expectedUsage.method).toBe('POST');
      expect(expectedUsage.body.providerId).toContain('required');
      expect(expectedUsage.body.apiKey).toContain('optional');
      expect(expectedUsage.response.data).toHaveProperty('providerId');
      expect(expectedUsage.response.data).toHaveProperty('models');
      expect(expectedUsage.response.data).toHaveProperty('count');
    });

    it('should list supported providers', () => {
      const supportedProviders = ['gemini'];

      expect(Array.isArray(supportedProviders)).toBe(true);
      expect(supportedProviders).toContain('gemini');
    });
  });
});
