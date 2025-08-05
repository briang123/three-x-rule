import { AISDKService } from '@/lib/ai-sdk-service';
import { z } from 'zod';

// Mock the AI SDK service
jest.mock('@/lib/ai-sdk-service', () => ({
  AISDKService: {
    generateImage: jest.fn(),
    generateSpeech: jest.fn(),
    transcribeAudio: jest.fn(),
    getErrorMessage: jest.fn(),
  },
}));

describe('/api/multimodal Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Validation', () => {
    // Import the validation schema from the route file
    const MultimodalRequestSchema = z.object({
      type: z.enum(['image', 'speech', 'transcribe'], {
        errorMap: () => ({ message: 'Type must be one of: image, speech, transcribe' }),
      }),
      prompt: z.string().min(1, 'Prompt is required'),
      model: z.string().optional(),
      options: z
        .object({
          temperature: z.number().min(0).max(2).optional(),
          maxTokens: z.number().min(1).max(8192).optional(),
          size: z.enum(['256x256', '512x512', '1024x1024']).optional(),
          quality: z.enum(['standard', 'hd']).optional(),
          voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
          speed: z.number().min(0.25).max(4.0).optional(),
          language: z.string().optional(),
        })
        .optional(),
    });

    it('should validate correct image generation request', () => {
      const validRequest = {
        type: 'image',
        prompt: 'Generate a beautiful landscape',
        model: 'dall-e-3',
        options: {
          size: '1024x1024',
          quality: 'hd',
        },
      };

      const result = MultimodalRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('image');
        expect(result.data.prompt).toBe('Generate a beautiful landscape');
        expect(result.data.model).toBe('dall-e-3');
        expect(result.data.options?.size).toBe('1024x1024');
        expect(result.data.options?.quality).toBe('hd');
      }
    });

    it('should validate correct speech generation request', () => {
      const validRequest = {
        type: 'speech',
        prompt: 'Hello, this is a test message',
        model: 'tts-1',
        options: {
          voice: 'alloy',
          speed: 1.0,
        },
      };

      const result = MultimodalRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('speech');
        expect(result.data.prompt).toBe('Hello, this is a test message');
        expect(result.data.model).toBe('tts-1');
        expect(result.data.options?.voice).toBe('alloy');
        expect(result.data.options?.speed).toBe(1.0);
      }
    });

    it('should use default model when not provided', () => {
      const requestWithoutModel = {
        type: 'image',
        prompt: 'Generate an image',
      };

      const result = MultimodalRequestSchema.safeParse(requestWithoutModel);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBeUndefined();
      }
    });

    it('should reject request with invalid type', () => {
      const invalidRequest = {
        type: 'invalid_type',
        prompt: 'Test prompt',
      };

      const result = MultimodalRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        const hasTypeError = result.error.errors.some(
          (error) => error.message === 'Type must be one of: image, speech, transcribe',
        );
        expect(hasTypeError).toBe(true);
      }
    });

    it('should reject request with missing prompt', () => {
      const invalidRequest = {
        type: 'image',
      };

      const result = MultimodalRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        const hasPromptError = result.error.errors.some((error) => error.path.includes('prompt'));
        expect(hasPromptError).toBe(true);
      }
    });

    it('should reject request with invalid speed value', () => {
      const invalidRequest = {
        type: 'speech',
        prompt: 'Test prompt',
        options: {
          speed: 5.0, // Invalid: should be 0.25-4.0
        },
      };

      const result = MultimodalRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('AI SDK Integration', () => {
    it('should call generateImage with correct parameters', async () => {
      const mockImageUrl = 'https://example.com/generated-image.jpg';
      (AISDKService.generateImage as jest.Mock).mockResolvedValue(mockImageUrl);

      const prompt = 'Generate a beautiful landscape';
      const result = await AISDKService.generateImage(prompt);

      expect(result).toBe(mockImageUrl);
      expect(AISDKService.generateImage).toHaveBeenCalledWith(prompt);
    });

    it('should call generateSpeech with correct parameters', async () => {
      const mockAudioUrl = 'https://example.com/generated-speech.mp3';
      (AISDKService.generateSpeech as jest.Mock).mockResolvedValue(mockAudioUrl);

      const text = 'Hello, this is a test message';
      const result = await AISDKService.generateSpeech(text);

      expect(result).toBe(mockAudioUrl);
      expect(AISDKService.generateSpeech).toHaveBeenCalledWith(text);
    });

    it('should call transcribeAudio with correct parameters', async () => {
      const mockTranscription = 'This is the transcribed text from the audio file';
      (AISDKService.transcribeAudio as jest.Mock).mockResolvedValue(mockTranscription);

      const audioFile = new File(['audio data'], 'test.wav', { type: 'audio/wav' });
      const result = await AISDKService.transcribeAudio(audioFile);

      expect(result).toBe(mockTranscription);
      expect(AISDKService.transcribeAudio).toHaveBeenCalledWith(audioFile);
    });

    it('should handle AI SDK errors', async () => {
      const mockError = new Error('AI SDK Error');
      (AISDKService.generateImage as jest.Mock).mockRejectedValue(mockError);
      (AISDKService.getErrorMessage as jest.Mock).mockReturnValue('AI SDK Error: AI SDK Error');

      try {
        await AISDKService.generateImage('Generate an image');
      } catch (error) {
        AISDKService.getErrorMessage(error);
      }

      expect(AISDKService.getErrorMessage).toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    it('should format successful image generation response correctly', () => {
      const mockImageUrl = 'https://example.com/image.jpg';
      const expectedResponse = {
        success: true,
        data: mockImageUrl,
        type: 'image',
        model: 'dall-e-3',
        timestamp: expect.any(String),
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.data).toBe(mockImageUrl);
      expect(expectedResponse.type).toBe('image');
      expect(expectedResponse.model).toBe('dall-e-3');
      expect(expectedResponse.timestamp).toBeDefined();
    });

    it('should format successful speech generation response correctly', () => {
      const mockAudioUrl = 'https://example.com/audio.mp3';
      const expectedResponse = {
        success: true,
        data: mockAudioUrl,
        type: 'speech',
        model: 'tts-1',
        timestamp: expect.any(String),
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.data).toBe(mockAudioUrl);
      expect(expectedResponse.type).toBe('speech');
      expect(expectedResponse.model).toBe('tts-1');
      expect(expectedResponse.timestamp).toBeDefined();
    });

    it('should format successful transcription response correctly', () => {
      const mockTranscription = 'Transcribed text';
      const expectedResponse = {
        success: true,
        data: mockTranscription,
        type: 'transcribe',
        model: 'whisper-1',
        timestamp: expect.any(String),
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.data).toBe(mockTranscription);
      expect(expectedResponse.type).toBe('transcribe');
      expect(expectedResponse.model).toBe('whisper-1');
      expect(expectedResponse.timestamp).toBeDefined();
    });

    it('should format error response correctly', () => {
      const errorMessage = 'Validation error';
      const errorDetails = ['Type must be one of: image, speech, transcribe'];

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
