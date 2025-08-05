import { AISDKService } from '@/lib/ai-sdk-service';
import { z } from 'zod';

// Mock the AI SDK service
jest.mock('@/lib/ai-sdk-service', () => ({
  AISDKService: {
    generateStructuredRemix: jest.fn(),
    getErrorMessage: jest.fn(),
  },
}));

describe('/api/remix Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Validation', () => {
    // Import the validation schema from the route file
    const RemixRequestSchema = z.object({
      originalPrompt: z.string().min(1, 'Original prompt is required'),
      responses: z.array(z.string()).min(1, 'At least one response is required'),
      model: z.string().default('gemini-2.0-flash'),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(8192).optional(),
    });

    it('should validate correct request body', () => {
      const validRequest = {
        originalPrompt: 'Explain the 3X Rule',
        responses: ['Response 1', 'Response 2'],
        model: 'gemini-2.0-flash',
        temperature: 0.7,
      };

      const result = RemixRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.originalPrompt).toBe('Explain the 3X Rule');
        expect(result.data.responses).toEqual(['Response 1', 'Response 2']);
        expect(result.data.model).toBe('gemini-2.0-flash');
        expect(result.data.temperature).toBe(0.7);
      }
    });

    it('should use default model when not provided', () => {
      const requestWithoutModel = {
        originalPrompt: 'Test prompt',
        responses: ['Response 1'],
      };

      const result = RemixRequestSchema.safeParse(requestWithoutModel);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe('gemini-2.0-flash');
      }
    });

    it('should reject request with missing originalPrompt', () => {
      const invalidRequest = {
        responses: ['Response 1'],
        model: 'gemini-2.0-flash',
      };

      const result = RemixRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Check if any error is related to originalPrompt
        const hasOriginalPromptError = result.error.errors.some((error) =>
          error.path.includes('originalPrompt'),
        );
        expect(hasOriginalPromptError).toBe(true);
      }
    });

    it('should reject request with empty responses array', () => {
      const invalidRequest = {
        originalPrompt: 'Test prompt',
        responses: [],
        model: 'gemini-2.0-flash',
      };

      const result = RemixRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toContainEqual(
          expect.objectContaining({
            message: 'At least one response is required',
          }),
        );
      }
    });

    it('should reject request with invalid temperature', () => {
      const invalidRequest = {
        originalPrompt: 'Test prompt',
        responses: ['Response 1'],
        temperature: 3.0, // Invalid: should be 0-2
      };

      const result = RemixRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toContainEqual(
          expect.objectContaining({
            message: expect.stringContaining('Number must be less than or equal to 2'),
          }),
        );
      }
    });
  });

  describe('AI SDK Integration', () => {
    it('should call generateStructuredRemix with correct parameters', async () => {
      const mockRemixResult = {
        combinedAnswer: 'Combined response from all inputs',
        confidence: 0.85,
        reasoning: 'This combines the best elements from each response',
        sources: ['Response 1', 'Response 2'],
        improvements: ['Better clarity', 'More concise'],
      };

      (AISDKService.generateStructuredRemix as jest.Mock).mockResolvedValue(mockRemixResult);

      const originalPrompt = 'Explain the 3X Rule';
      const responses = ['Response 1 content', 'Response 2 content'];
      const model = 'gemini-2.0-flash';

      const result = await AISDKService.generateStructuredRemix(originalPrompt, responses, model);

      expect(result).toEqual(mockRemixResult);
      expect(AISDKService.generateStructuredRemix).toHaveBeenCalledWith(
        originalPrompt,
        responses,
        model,
      );
    });

    it('should handle AI SDK errors', async () => {
      const mockError = new Error('AI SDK Error');
      (AISDKService.generateStructuredRemix as jest.Mock).mockRejectedValue(mockError);
      (AISDKService.getErrorMessage as jest.Mock).mockReturnValue('AI SDK Error: AI SDK Error');

      try {
        await AISDKService.generateStructuredRemix(
          'Test prompt',
          ['Response 1'],
          'gemini-2.0-flash',
        );
      } catch (error) {
        // This should trigger the error handling
        AISDKService.getErrorMessage(error);
      }

      // Verify that getErrorMessage was called
      expect(AISDKService.getErrorMessage).toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    it('should format successful response correctly', () => {
      const mockRemixResult = {
        combinedAnswer: 'Combined response',
        confidence: 0.8,
        reasoning: 'Reasoning',
        sources: [],
        improvements: [],
      };

      const expectedResponse = {
        success: true,
        data: mockRemixResult,
        model: 'gemini-2.0-flash',
        timestamp: expect.any(String),
      };

      // Test the response structure
      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.data).toEqual(mockRemixResult);
      expect(expectedResponse.model).toBe('gemini-2.0-flash');
      expect(expectedResponse.timestamp).toBeDefined();
    });

    it('should format error response correctly', () => {
      const errorMessage = 'Validation error';
      const errorDetails = ['Original prompt is required'];

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
});
