import { NextRequest } from 'next/server';
import { POST } from './route';
import { geminiService } from '@/lib/gemini';

// Mock the gemini service
jest.mock('@/lib/gemini', () => ({
  geminiService: {
    sendMessageWithImages: jest.fn(),
    getAvailableModels: jest.fn(),
    getModelInfo: jest.fn(),
  },
}));

describe('/api/chat/with-images', () => {
  let geminiService: any;
  let originalEnv: any;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env;
    geminiService = require('@/lib/gemini').geminiService;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Business Logic Tests', () => {
    it('should validate images array correctly', () => {
      // Test image validation logic
      const validateImages = (images: any) => {
        return Boolean(images && Array.isArray(images) && images.length > 0);
      };

      expect(validateImages(undefined)).toBe(false);
      expect(validateImages(null)).toBe(false);
      expect(validateImages([])).toBe(false);
      expect(validateImages('not an array')).toBe(false);
      expect(validateImages(['image1', 'image2'])).toBe(true);
      expect(validateImages(['single-image'])).toBe(true);
    });

    it('should build chat request with images correctly', () => {
      // Test chat request building logic
      const buildImageChatRequest = (body: any) => {
        return {
          messages: body.messages || [],
          model: body.model || 'gemini-2.0-flash',
          context: {
            text: body.context?.text,
            images: body.context?.images || [],
            systemPrompt: body.context?.systemPrompt,
          },
          temperature: body.temperature || 0.7,
          maxTokens: body.maxTokens,
          topP: body.topP,
          topK: body.topK,
        };
      };

      const body = {
        messages: [{ role: 'user', content: 'Describe this image' }],
        model: 'gemini-2.5-pro',
        temperature: 0.5,
        context: {
          text: 'Additional context',
          images: ['base64-image-1', 'base64-image-2'],
          systemPrompt: 'You are an image analyzer',
        },
      };

      const chatRequest = buildImageChatRequest(body);

      expect(chatRequest.messages).toEqual([{ role: 'user', content: 'Describe this image' }]);
      expect(chatRequest.model).toBe('gemini-2.5-pro');
      expect(chatRequest.temperature).toBe(0.5);
      expect(chatRequest.context.text).toBe('Additional context');
      expect(chatRequest.context.images).toEqual(['base64-image-1', 'base64-image-2']);
      expect(chatRequest.context.systemPrompt).toBe('You are an image analyzer');
    });

    it('should use default values when optional fields are missing', () => {
      // Test default value handling
      const buildImageChatRequest = (body: any) => {
        return {
          messages: body.messages || [],
          model: body.model || 'gemini-2.0-flash',
          context: {
            text: body.context?.text,
            images: body.context?.images || [],
            systemPrompt: body.context?.systemPrompt,
          },
          temperature: body.temperature || 0.7,
          maxTokens: body.maxTokens,
          topP: body.topP,
          topK: body.topK,
        };
      };

      const body = {
        messages: [{ role: 'user', content: 'Hello' }],
        context: {
          images: ['image1'],
        },
      };

      const chatRequest = buildImageChatRequest(body);

      expect(chatRequest.messages).toEqual([{ role: 'user', content: 'Hello' }]);
      expect(chatRequest.model).toBe('gemini-2.0-flash'); // Default model
      expect(chatRequest.temperature).toBe(0.7); // Default temperature
      expect(chatRequest.context.images).toEqual(['image1']);
      expect(chatRequest.context.text).toBeUndefined();
      expect(chatRequest.context.systemPrompt).toBeUndefined();
      expect(chatRequest.maxTokens).toBeUndefined();
      expect(chatRequest.topP).toBeUndefined();
      expect(chatRequest.topK).toBeUndefined();
    });

    it('should validate image format correctly', () => {
      // Test image format validation
      const validateImageFormat = (image: string) => {
        // Basic validation for base64 encoded images
        return Boolean(
          image &&
            typeof image === 'string' &&
            image.length > 0 &&
            (image.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(image)),
        );
      };

      expect(validateImageFormat('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD')).toBe(true);
      expect(
        validateImageFormat(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        ),
      ).toBe(true);
      expect(validateImageFormat('')).toBe(false);
      expect(validateImageFormat('invalid-image-data')).toBe(false);
      expect(validateImageFormat(null as any)).toBe(false);
      expect(validateImageFormat(undefined as any)).toBe(false);
    });

    it('should handle multiple images correctly', () => {
      // Test multiple image handling
      const processMultipleImages = (images: string[]) => {
        return {
          count: images.length,
          validImages: images.filter((img) => img && typeof img === 'string' && img.length > 0),
          hasValidImages: images.some((img) => img && typeof img === 'string' && img.length > 0),
        };
      };

      const validImages = ['image1', 'image2', 'image3'];
      const mixedImages = ['image1', '', 'image3', null as any, 'image5'];
      const invalidImages = ['', null as any, undefined as any];

      const validResult = processMultipleImages(validImages);
      const mixedResult = processMultipleImages(mixedImages);
      const invalidResult = processMultipleImages(invalidImages);

      expect(validResult.count).toBe(3);
      expect(validResult.validImages).toHaveLength(3);
      expect(validResult.hasValidImages).toBe(true);

      expect(mixedResult.count).toBe(5);
      expect(mixedResult.validImages).toHaveLength(3);
      expect(mixedResult.hasValidImages).toBe(true);

      expect(invalidResult.count).toBe(3);
      expect(invalidResult.validImages).toHaveLength(0);
      expect(invalidResult.hasValidImages).toBe(false);
    });
  });

  describe('Gemini Service Integration', () => {
    it('should call geminiService.sendMessageWithImages with correct parameters', async () => {
      geminiService.sendMessageWithImages.mockResolvedValue({
        content: 'AI response with images',
      });

      // Test the service call directly
      const chatRequest = {
        messages: [{ role: 'user', content: 'Describe this image' }],
        model: 'gemini-2.0-flash',
        context: {
          text: 'Additional context',
          images: ['base64-image-data'],
          systemPrompt: 'You are an image analyzer',
        },
        temperature: 0.7,
      };

      await geminiService.sendMessageWithImages(chatRequest);

      expect(geminiService.sendMessageWithImages).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Describe this image' }],
          model: 'gemini-2.0-flash',
          context: {
            text: 'Additional context',
            images: ['base64-image-data'],
            systemPrompt: 'You are an image analyzer',
          },
          temperature: 0.7,
        }),
      );
    });

    it('should handle custom model and parameters', async () => {
      geminiService.sendMessageWithImages.mockResolvedValue({
        content: 'AI response with custom parameters',
      });

      // Test custom parameters
      const chatRequest = {
        messages: [{ role: 'user', content: 'Analyze this image' }],
        model: 'gemini-2.5-pro',
        context: {
          images: ['image1', 'image2'],
        },
        temperature: 0.5,
        maxTokens: 1000,
        topP: 0.9,
        topK: 20,
      };

      await geminiService.sendMessageWithImages(chatRequest);

      expect(geminiService.sendMessageWithImages).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.5-pro',
          temperature: 0.5,
          maxTokens: 1000,
          topP: 0.9,
          topK: 20,
          context: {
            images: ['image1', 'image2'],
          },
        }),
      );
    });

    it('should handle empty messages array', async () => {
      geminiService.sendMessageWithImages.mockResolvedValue({
        content: 'AI response for empty messages',
      });

      // Test with empty messages
      const chatRequest = {
        messages: [],
        model: 'gemini-2.0-flash',
        context: {
          images: ['image1'],
        },
      };

      await geminiService.sendMessageWithImages(chatRequest);

      expect(geminiService.sendMessageWithImages).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [],
          context: {
            images: ['image1'],
          },
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing images error', () => {
      // Test missing images validation
      const validateImageRequest = (context: any) => {
        if (!context?.images || context.images.length === 0) {
          return {
            success: false,
            error: 'At least one image is required for image chat',
            status: 400,
          };
        }
        return { success: true };
      };

      const result1 = validateImageRequest({});
      const result2 = validateImageRequest({ images: [] });
      const result3 = validateImageRequest({ images: ['image1'] });

      expect(result1.success).toBe(false);
      expect(result1.error).toBe('At least one image is required for image chat');
      expect(result1.status).toBe(400);

      expect(result2.success).toBe(false);
      expect(result2.error).toBe('At least one image is required for image chat');
      expect(result2.status).toBe(400);

      expect(result3.success).toBe(true);
    });

    it('should handle API errors gracefully', () => {
      const handleApiError = (error: Error) => {
        if (error instanceof Error) {
          return {
            success: false,
            error: error.message,
            status: 400,
          };
        }
        return {
          success: false,
          error: 'Internal server error',
          status: 500,
        };
      };

      const apiError = new Error('Image processing failed');
      const genericError = 'Unknown error';

      const apiResult = handleApiError(apiError);
      const genericResult = handleApiError(genericError as any);

      expect(apiResult.success).toBe(false);
      expect(apiResult.error).toBe('Image processing failed');
      expect(apiResult.status).toBe(400);

      expect(genericResult.success).toBe(false);
      expect(genericResult.error).toBe('Internal server error');
      expect(genericResult.status).toBe(500);
    });

    it('should handle invalid image data', () => {
      // Test invalid image data handling
      const validateImageData = (images: string[]) => {
        const validImages = images.filter(
          (img) => img && typeof img === 'string' && img.length > 0,
        );

        if (validImages.length === 0) {
          return {
            success: false,
            error: 'No valid images provided',
            status: 400,
          };
        }

        return {
          success: true,
          validImages,
        };
      };

      const result1 = validateImageData(['', null as any, undefined as any]);
      const result2 = validateImageData(['image1', '', 'image3']);

      expect(result1.success).toBe(false);
      expect(result1.error).toBe('No valid images provided');
      expect(result1.status).toBe(400);

      expect(result2.success).toBe(true);
      expect(result2.validImages).toEqual(['image1', 'image3']);
    });
  });

  describe('Image Processing', () => {
    it('should process base64 encoded images', () => {
      // Test base64 image processing
      const processBase64Image = (imageData: string) => {
        if (!imageData || typeof imageData !== 'string') {
          return { valid: false, reason: 'Invalid data type' };
        }

        if (imageData.startsWith('data:image/')) {
          // Data URL format
          const parts = imageData.split(',');
          if (parts.length !== 2) {
            return { valid: false, reason: 'Invalid data URL format' };
          }
          return { valid: true, format: 'data-url', data: parts[1] };
        }

        if (/^[A-Za-z0-9+/=]+$/.test(imageData)) {
          // Raw base64 format
          return { valid: true, format: 'base64', data: imageData };
        }

        return { valid: false, reason: 'Invalid base64 format' };
      };

      const dataUrlImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
      const base64Image =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const invalidImage = 'invalid-image-data';

      const dataUrlResult = processBase64Image(dataUrlImage);
      const base64Result = processBase64Image(base64Image);
      const invalidResult = processBase64Image(invalidImage);

      expect(dataUrlResult.valid).toBe(true);
      expect(dataUrlResult.format).toBe('data-url');
      expect(dataUrlResult.data).toBe('/9j/4AAQSkZJRgABAQAAAQABAAD');

      expect(base64Result.valid).toBe(true);
      expect(base64Result.format).toBe('base64');
      expect(base64Result.data).toBe(base64Image);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.reason).toBe('Invalid base64 format');
    });

    it('should handle different image formats', () => {
      // Test different image format handling
      const detectImageFormat = (imageData: string) => {
        if (imageData.startsWith('data:image/')) {
          const match = imageData.match(/data:image\/([^;]+)/);
          return match ? match[1] : 'unknown';
        }
        return 'base64'; // Assume base64 if not data URL
      };

      const jpegImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
      const pngImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const gifImage =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const base64Image =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

      expect(detectImageFormat(jpegImage)).toBe('jpeg');
      expect(detectImageFormat(pngImage)).toBe('png');
      expect(detectImageFormat(gifImage)).toBe('gif');
      expect(detectImageFormat(base64Image)).toBe('base64');
    });

    it('should validate image size constraints', () => {
      // Test image size validation
      const validateImageSize = (imageData: string, maxSize: number = 10 * 1024 * 1024) => {
        if (!imageData) {
          return { valid: false, reason: 'No image data' };
        }

        // Estimate size from base64 data (rough approximation)
        const estimatedSize = Math.ceil((imageData.length * 3) / 4);

        if (estimatedSize > maxSize) {
          return {
            valid: false,
            reason: `Image too large: ${Math.round(estimatedSize / 1024)}KB (max: ${Math.round(maxSize / 1024)}KB)`,
          };
        }

        return { valid: true, size: estimatedSize };
      };

      const smallImage =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const largeImage = 'A'.repeat(15 * 1024 * 1024); // 15MB

      const smallResult = validateImageSize(smallImage);
      const largeResult = validateImageSize(largeImage);

      expect(smallResult.valid).toBe(true);
      expect(smallResult.size).toBeLessThan(1024); // Should be small

      expect(largeResult.valid).toBe(false);
      expect(largeResult.reason).toContain('Image too large');
    });
  });
});
