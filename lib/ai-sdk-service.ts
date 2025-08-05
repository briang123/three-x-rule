import {
  generateText,
  generateObject,
  streamText,
  streamObject,
  AISDKError,
  APICallError,
} from 'ai';
import { z } from 'zod';
import { getProviderConfigWithModels } from './providers';
import { RemixResponseSchema, SocialPostSchema, ContentEnhancementSchema } from './schemas';

export class AISDKService {
  // Enhanced text generation with retry logic
  static async generateText(
    prompt: string,
    model: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      maxRetries?: number;
      providerId?: string;
      apiKey?: string;
    },
  ) {
    try {
      return await generateText({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature || 0.7,
        maxRetries: options?.maxRetries || 3,
      });
    } catch (error) {
      if (error instanceof APICallError) {
        throw new Error(`API Error: ${error.message}`);
      }
      throw error;
    }
  }

  // Structured remix generation
  static async generateStructuredRemix(
    originalPrompt: string,
    responses: string[],
    model: string,
    options?: {
      providerId?: string;
      apiKey?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ) {
    const combinedResponses = responses
      .map((response, index) => `Response ${index + 1}:\n${response}`)
      .join('\n\n---\n\n');

    const remixPrompt = `${originalPrompt}\n\nCombine the best parts from all responses and provide a synthesized response.\n\nResponses to combine:\n\n${combinedResponses}`;

    // Type assertion needed due to AI SDK v5's complex generic types
    return await (generateObject as any)({
      model,
      messages: [{ role: 'user', content: remixPrompt }],
      schema: RemixResponseSchema,
      temperature: options?.temperature || 0.7,
    });
  }

  // Multi-modal capabilities - simplified for now
  static async generateImage(prompt: string) {
    // TODO: Implement with proper image generation API
    throw new Error('Image generation not implemented yet');
  }

  static async generateSpeech(text: string) {
    // TODO: Implement with proper speech generation API
    throw new Error('Speech generation not implemented yet');
  }

  static async transcribeAudio(audioFile: File) {
    // TODO: Implement with proper transcription API
    throw new Error('Audio transcription not implemented yet');
  }

  // Content enhancement
  static async enhanceContent(
    content: string,
    model: string,
    options?: {
      providerId?: string;
      apiKey?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ) {
    const enhancementPrompt = `Enhance this content with better structure, clarity, and engagement: ${content}`;

    // Type assertion needed due to AI SDK v5's complex generic types
    return await (generateObject as any)({
      model,
      messages: [{ role: 'user', content: enhancementPrompt }],
      schema: ContentEnhancementSchema,
      temperature: options?.temperature || 0.7,
    });
  }

  // Streaming text generation
  static async streamText(
    prompt: string,
    model: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      providerId?: string;
      apiKey?: string;
    },
  ) {
    return await streamText({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
    });
  }

  // Streaming object generation
  static async streamObject(
    prompt: string,
    model: string,
    schema: z.ZodSchema,
    options?: {
      temperature?: number;
      maxTokens?: number;
      providerId?: string;
      apiKey?: string;
    },
  ) {
    // Type assertion needed due to AI SDK v5's complex generic types
    return await (streamObject as any)({
      model,
      messages: [{ role: 'user', content: prompt }],
      schema,
      temperature: options?.temperature || 0.7,
    });
  }

  // Social post generation
  static async generateSocialPost(
    topic: string,
    platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram',
    model: string,
    options?: {
      tone?: string;
      includeHashtags?: boolean;
      maxLength?: number;
      providerId?: string;
      apiKey?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ) {
    const platformConfig = {
      twitter: { maxLength: 280, hashtagCount: 3 },
      linkedin: { maxLength: 3000, hashtagCount: 5 },
      facebook: { maxLength: 63206, hashtagCount: 3 },
      instagram: { maxLength: 2200, hashtagCount: 30 },
    };

    const config = platformConfig[platform];
    const maxLength = options?.maxLength || config.maxLength;

    const prompt = `Create a ${platform} post about "${topic}" with the following requirements:
- Tone: ${options?.tone || 'professional'}
- Maximum length: ${maxLength} characters
- Include hashtags: ${options?.includeHashtags ? 'yes' : 'no'}
- Platform-specific best practices for ${platform}`;

    // Type assertion needed due to AI SDK v5's complex generic types
    return await (generateObject as any)({
      model,
      messages: [{ role: 'user', content: prompt }],
      schema: SocialPostSchema,
      temperature: options?.temperature || 0.7,
    });
  }

  // Dynamic model fetching
  static async getAvailableModels(providerId: string, apiKey?: string) {
    try {
      const providerConfig = await getProviderConfigWithModels(providerId, apiKey);
      return providerConfig?.models || [];
    } catch (error) {
      console.error(`Error fetching models for provider ${providerId}:`, error);
      return [];
    }
  }

  static async validateModel(providerId: string, model: string, apiKey?: string): Promise<boolean> {
    try {
      const availableModels = await this.getAvailableModels(providerId, apiKey);
      return availableModels.some((m: any) => m.id === model);
    } catch (error) {
      console.error(`Error validating model ${model} for provider ${providerId}:`, error);
      return false;
    }
  }

  // Error handling utilities
  static isAISDKError(error: unknown): error is AISDKError {
    return error instanceof AISDKError;
  }

  static isAPICallError(error: unknown): error is APICallError {
    return error instanceof APICallError;
  }

  static getErrorMessage(error: unknown): string {
    if (this.isAISDKError(error)) {
      return error.message;
    }
    if (this.isAPICallError(error)) {
      return error.message;
    }
    return 'An unknown error occurred';
  }
}
