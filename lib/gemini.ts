import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import { z } from 'zod';

// Environment variable validation
const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
});

// Message schema for validation
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
});

const ContextSchema = z.object({
  text: z.string().optional(),
  images: z.array(z.string()).optional(), // Base64 encoded images
  files: z
    .array(
      z.object({
        name: z.string(),
        content: z.string(),
        mimeType: z.string(),
      }),
    )
    .optional(),
  systemPrompt: z.string().optional(),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
  model: z.string().default('gemini-2.0-flash'),
  context: ContextSchema.optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(8192).optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().min(1).max(40).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  finishReason: string;
};

export type GeminiModel =
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private models: Map<string, GenerativeModel> = new Map();

  constructor() {
    const env = envSchema.parse(process.env);
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  private getModel(modelName: string): GenerativeModel {
    if (!this.models.has(modelName)) {
      const model = this.genAI.getGenerativeModel({
        model: modelName,
      });
      this.models.set(modelName, model);
    }
    return this.models.get(modelName)!;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Validate the request
      const validatedRequest = ChatRequestSchema.parse(request);

      const model = this.getModel(validatedRequest.model);

      // Configure generation config
      const generationConfig = {
        temperature: validatedRequest.temperature,
        topP: validatedRequest.topP,
        topK: validatedRequest.topK,
        maxOutputTokens: validatedRequest.maxTokens,
      };

      // Start a chat session
      const chat = model.startChat({
        generationConfig,
        history: validatedRequest.messages.slice(0, -1).map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      });

      // Prepare the current message with context
      const currentMessage = validatedRequest.messages[validatedRequest.messages.length - 1];
      let messageContent = currentMessage.content;

      // Add context if provided
      if (validatedRequest.context) {
        const context = validatedRequest.context;

        if (context.systemPrompt) {
          messageContent = `System: ${context.systemPrompt}\n\nUser: ${messageContent}`;
        }

        if (context.text) {
          messageContent = `Context: ${context.text}\n\n${messageContent}`;
        }
      }

      // Send the message
      const result = await chat.sendMessage(messageContent);
      const response = await result.response;

      // Get usage information
      const usage = result.response.usageMetadata || {
        promptTokenCount: 0,
        candidatesTokenCount: 0,
        totalTokenCount: 0,
      };

      return {
        content: response.text(),
        model: validatedRequest.model,
        usage: {
          promptTokens: usage.promptTokenCount || 0,
          responseTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        },
        finishReason: 'STOP', // Default finish reason
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async sendMessageWithImages(
    request: Omit<ChatRequest, 'context'> & {
      context: {
        text?: string;
        images: string[]; // Base64 encoded images
        systemPrompt?: string;
      };
    },
  ): Promise<ChatResponse> {
    try {
      const validatedRequest = ChatRequestSchema.parse(request);
      const model = this.getModel(validatedRequest.model);

      // Configure generation config
      const generationConfig = {
        temperature: validatedRequest.temperature,
        topP: validatedRequest.topP,
        topK: validatedRequest.topK,
        maxOutputTokens: validatedRequest.maxTokens,
      };

      // Start a chat session
      const chat = model.startChat({
        generationConfig,
        history: validatedRequest.messages.slice(0, -1).map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      });

      const currentMessage = validatedRequest.messages[validatedRequest.messages.length - 1];
      let messageContent = currentMessage.content;

      // Add context
      if (validatedRequest.context?.systemPrompt) {
        messageContent = `System: ${validatedRequest.context.systemPrompt}\n\nUser: ${messageContent}`;
      }

      if (validatedRequest.context?.text) {
        messageContent = `Context: ${validatedRequest.context.text}\n\n${messageContent}`;
      }

      // Prepare parts with images
      const parts = [{ text: messageContent }];

      // Add images
      if (validatedRequest.context?.images) {
        for (const imageBase64 of validatedRequest.context.images) {
          parts.push({
            inlineData: {
              data: imageBase64,
              mimeType: 'image/jpeg', // You might want to detect this dynamically
            },
          } as any); // Type assertion for inlineData
        }
      }

      // Send the message with images
      const result = await chat.sendMessage(parts);
      const response = await result.response;

      const usage = result.response.usageMetadata || {
        promptTokenCount: 0,
        candidatesTokenCount: 0,
        totalTokenCount: 0,
      };

      return {
        content: response.text(),
        model: validatedRequest.model,
        usage: {
          promptTokens: usage.promptTokenCount || 0,
          responseTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        },
        finishReason: 'STOP', // Default finish reason
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  // Get available models
  getAvailableModels(): GeminiModel[] {
    return [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ];
  }

  // Get model information
  getModelInfo(modelName: GeminiModel) {
    const modelInfo = {
      'gemini-2.5-pro': {
        name: 'Gemini 2.5 Pro',
        description: 'Most powerful thinking model with maximum response accuracy',
        maxInputTokens: 2097152,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-2.5-flash': {
        name: 'Gemini 2.5 Flash',
        description: 'Best price-performance model with well-rounded capabilities',
        maxInputTokens: 2097152,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-2.5-flash-lite': {
        name: 'Gemini 2.5 Flash Lite',
        description: 'Most cost-efficient model supporting high throughput',
        maxInputTokens: 2097152,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-2.0-flash': {
        name: 'Gemini 2.0 Flash',
        description: 'Next generation features, speed, and realtime streaming',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-2.0-flash-lite': {
        name: 'Gemini 2.0 Flash Lite',
        description: 'Cost efficiency and low latency',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-1.5-pro': {
        name: 'Gemini 1.5 Pro',
        description: 'Long context window and multimodal capabilities',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-1.5-flash': {
        name: 'Gemini 1.5 Flash',
        description: 'Fast and efficient model',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
    };

    return modelInfo[modelName];
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
