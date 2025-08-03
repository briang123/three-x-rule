# Vercel AI SDK Migration Plan

## Overview

This document outlines a step-by-step migration path to integrate Vercel AI SDK's advanced capabilities into the existing Three-X-Rule application while maintaining backward compatibility and enhancing functionality.

## 🎯 Migration Goals

1. **Enhance Remix Functionality** - Use structured data generation for better remix responses
2. **Add Multi-Modal Capabilities** - Support image generation, speech synthesis, and transcription
3. **Improve Error Handling** - Leverage AI SDK's built-in error types and retry logic
4. **Enable Tool Integration** - Add function calling for enhanced content processing
5. **Maintain Compatibility** - Keep existing functionality working during migration

## 📋 Phase 1: Core Infrastructure (Week 1)

### 1.1 Create AI SDK Service Layer

**File: `lib/ai-sdk-service.ts`**

```typescript
import {
  generateText,
  generateObject,
  streamText,
  streamObject,
  experimental_generateImage,
  experimental_generateSpeech,
  experimental_transcribe,
  customProvider,
  tool,
  AISDKError,
  APICallError,
} from 'ai';
import { z } from 'zod';
import { geminiService } from './gemini';

// Custom Gemini provider for AI SDK
const geminiProvider = customProvider({
  id: 'gemini',
  generateText: async ({ model, messages, temperature, maxTokens }) => {
    const response = await geminiService.sendMessage({
      messages,
      model,
      temperature,
      maxTokens,
    });
    return { text: response.content };
  },
});

// Structured remix response schema
const RemixResponseSchema = z.object({
  combinedAnswer: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  sources: z.array(z.string()),
  improvements: z.array(z.string()),
});

// Social post schema
const SocialPostSchema = z.object({
  content: z.string(),
  hashtags: z.array(z.string()),
  characterCount: z.number(),
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram']),
});

export class AISDKService {
  // Enhanced text generation with retry logic
  static async generateText(
    prompt: string,
    model: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      maxRetries?: number;
    },
  ) {
    try {
      return await generateText({
        provider: 'gemini',
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens,
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
  static async generateStructuredRemix(originalPrompt: string, responses: string[], model: string) {
    const combinedResponses = responses
      .map((response, index) => `Response ${index + 1}:\n${response}`)
      .join('\n\n---\n\n');

    const remixPrompt = `${originalPrompt}\n\nCombine the best parts from all responses and provide a synthesized response.\n\nResponses to combine:\n\n${combinedResponses}`;

    return await generateObject({
      provider: 'gemini',
      model,
      messages: [{ role: 'user', content: remixPrompt }],
      schema: RemixResponseSchema,
    });
  }

  // Multi-modal capabilities
  static async generateImage(prompt: string) {
    return await experimental_generateImage({
      model: 'dall-e-3',
      prompt,
    });
  }

  static async generateSpeech(text: string) {
    return await experimental_generateSpeech({
      model: 'tts-1',
      input: text,
    });
  }

  static async transcribeAudio(audioFile: File) {
    return await experimental_transcribe({
      model: 'whisper-1',
      file: audioFile,
    });
  }

  // Tool-based content enhancement
  static async enhanceContent(content: string, model: string) {
    const factCheckTool = tool({
      name: 'fact_check',
      description: 'Verify facts and provide sources',
      parameters: z.object({ content: z.string() }),
      execute: async ({ content }) => {
        // Implement fact-checking logic
        return { verified: true, sources: ['source1', 'source2'] };
      },
    });

    const formatTool = tool({
      name: 'format_content',
      description: 'Format content for different platforms',
      parameters: z.object({
        content: z.string(),
        platform: z.enum(['twitter', 'linkedin', 'facebook']),
      }),
      execute: async ({ content, platform }) => {
        // Implement formatting logic
        return { formattedContent: content, characterCount: content.length };
      },
    });

    return await generateText({
      provider: 'gemini',
      model,
      messages: [{ role: 'user', content: `Enhance this content: ${content}` }],
      tools: [factCheckTool, formatTool],
    });
  }
}
```

### 1.2 Update API Routes

**File: `app/api/chat/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { streamText, streamObject } from 'ai';
import { AISDKService } from '@/lib/ai-sdk-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Enhanced validation
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 },
      );
    }

    const { messages, model, structured, schema } = body;

    // Use AI SDK for streaming
    if (structured && schema) {
      return streamObject({
        provider: 'gemini',
        model: model || 'gemini-2.0-flash',
        messages,
        schema: JSON.parse(schema),
      });
    }

    return streamText({
      provider: 'gemini',
      model: model || 'gemini-2.0-flash',
      messages,
      temperature: body.temperature || 0.7,
      maxTokens: body.maxTokens,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

**File: `app/api/remix/route.ts`** (New)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AISDKService } from '@/lib/ai-sdk-service';

export async function POST(request: NextRequest) {
  try {
    const { originalPrompt, responses, model } = await request.json();

    const remixResult = await AISDKService.generateStructuredRemix(
      originalPrompt,
      responses,
      model,
    );

    return NextResponse.json({ success: true, data: remixResult });
  } catch (error) {
    console.error('Remix API Error:', error);
    return NextResponse.json({ success: false, error: 'Remix generation failed' }, { status: 500 });
  }
}
```

**File: `app/api/multimodal/route.ts`** (New)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AISDKService } from '@/lib/ai-sdk-service';

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, model } = await request.json();

    let result;
    switch (type) {
      case 'image':
        result = await AISDKService.generateImage(prompt);
        break;
      case 'speech':
        result = await AISDKService.generateSpeech(prompt);
        break;
      default:
        throw new Error('Unsupported multimodal type');
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Multimodal API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Multimodal generation failed' },
      { status: 500 },
    );
  }
}
```

## 📋 Phase 2: Enhanced Hooks (Week 2)

### 2.1 Create AI SDK Hooks

**File: `hooks/useAISDK.ts`**

```typescript
import { useState, useCallback } from 'react';
import { AISDKService } from '@/lib/ai-sdk-service';

interface UseAISDKReturn {
  // Text generation
  generateText: (prompt: string, model: string, options?: any) => Promise<string>;
  isGeneratingText: boolean;

  // Structured generation
  generateStructuredRemix: (prompt: string, responses: string[], model: string) => Promise<any>;
  isGeneratingRemix: boolean;

  // Multimodal
  generateImage: (prompt: string) => Promise<string>;
  generateSpeech: (text: string) => Promise<string>;
  transcribeAudio: (file: File) => Promise<string>;
  isGeneratingMultimodal: boolean;

  // Content enhancement
  enhanceContent: (content: string, model: string) => Promise<string>;
  isEnhancingContent: boolean;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useAISDK = (): UseAISDKReturn => {
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingRemix, setIsGeneratingRemix] = useState(false);
  const [isGeneratingMultimodal, setIsGeneratingMultimodal] = useState(false);
  const [isEnhancingContent, setIsEnhancingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateText = useCallback(async (prompt: string, model: string, options?: any) => {
    setIsGeneratingText(true);
    setError(null);
    try {
      const result = await AISDKService.generateText(prompt, model, options);
      return result.text;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsGeneratingText(false);
    }
  }, []);

  const generateStructuredRemix = useCallback(
    async (prompt: string, responses: string[], model: string) => {
      setIsGeneratingRemix(true);
      setError(null);
      try {
        return await AISDKService.generateStructuredRemix(prompt, responses, model);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        setIsGeneratingRemix(false);
      }
    },
    [],
  );

  const generateImage = useCallback(async (prompt: string) => {
    setIsGeneratingMultimodal(true);
    setError(null);
    try {
      return await AISDKService.generateImage(prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsGeneratingMultimodal(false);
    }
  }, []);

  const generateSpeech = useCallback(async (text: string) => {
    setIsGeneratingMultimodal(true);
    setError(null);
    try {
      return await AISDKService.generateSpeech(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsGeneratingMultimodal(false);
    }
  }, []);

  const transcribeAudio = useCallback(async (file: File) => {
    setIsGeneratingMultimodal(true);
    setError(null);
    try {
      return await AISDKService.transcribeAudio(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsGeneratingMultimodal(false);
    }
  }, []);

  const enhanceContent = useCallback(async (content: string, model: string) => {
    setIsEnhancingContent(true);
    setError(null);
    try {
      const result = await AISDKService.enhanceContent(content, model);
      return result.text;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsEnhancingContent(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    generateText,
    isGeneratingText,
    generateStructuredRemix,
    isGeneratingRemix,
    generateImage,
    generateSpeech,
    transcribeAudio,
    isGeneratingMultimodal,
    enhanceContent,
    isEnhancingContent,
    error,
    clearError,
  };
};
```

### 2.2 Update Existing Event Handlers

**File: `hooks/useEventHandlers.ts`** (Partial Update)

```typescript
// Add AI SDK import
import { useAISDK } from './useAISDK';

export const useEventHandlers = (props: UseEventHandlersProps) => {
  const aiSDK = useAISDK();

  // Enhanced remix handler with structured responses
  const handleRemix = useCallback(
    async (modelId: string) => {
      const hasResponses = Object.values(originalResponses).some(
        (response) => response.trim() !== '',
      );
      if (!hasResponses) {
        alert('No responses available to remix. Please generate some responses first.');
        return;
      }

      if (!currentMessage.trim()) {
        alert('No current message to remix. Please submit a prompt first.');
        return;
      }

      setIsRemixGenerating(true);
      setShowRemix(true);
      setRemixResponses((prev) => [...prev, '']);
      setRemixModels((prev) => [...prev, modelId]);
      setRemixModel(modelId);

      try {
        const responses = Object.entries(originalResponses)
          .filter(([_, response]) => response.trim() !== '')
          .map(([_, response]) => response);

        // Use AI SDK for structured remix
        const remixResult = await aiSDK.generateStructuredRemix(currentMessage, responses, modelId);

        // Update with structured response
        setRemixResponses((prev) => {
          const newResponses = [...prev];
          newResponses[newResponses.length - 1] = remixResult.combinedAnswer;
          return newResponses;
        });

        // Store additional metadata (confidence, reasoning, etc.)
        // This could be used for UI enhancements
      } catch (error) {
        console.error('Error in remix:', error);
        const errorMessage = aiSDK.error || 'Remix generation failed';
        setRemixResponses((prev) => [...prev, errorMessage]);
      } finally {
        setIsRemixGenerating(false);
      }
    },
    [originalResponses, currentMessage, aiSDK /* ... other deps */],
  );

  // Enhanced social posts with multimodal capabilities
  const handleSocialPostsGenerate = useCallback(
    async (config: SocialPostConfig) => {
      // ... existing logic ...

      try {
        // Generate content using AI SDK
        const content = await aiSDK.generateText(
          `Generate a ${config.platform} post about: ${config.topic}`,
          config.model,
          { temperature: 0.8 },
        );

        // Optionally generate image for the post
        if (config.generateImage) {
          const imageUrl = await aiSDK.generateImage(
            `Create a professional image for: ${config.topic}`,
          );
          // Store image URL in config
        }

        // Optionally generate speech for audio posts
        if (config.generateAudio) {
          const audioUrl = await aiSDK.generateSpeech(content);
          // Store audio URL in config
        }

        // ... rest of existing logic ...
      } catch (error) {
        console.error('Error generating social posts:', error);
        // Handle error with AI SDK error handling
      }
    },
    [aiSDK /* ... other deps */],
  );

  // ... rest of existing handlers ...
};
```

## 📋 Phase 3: UI Enhancements (Week 3)

### 3.1 Enhanced Remix Component

**File: `components/EnhancedRemixResponse.tsx`** (New)

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface EnhancedRemixResponseProps {
  remixData: {
    combinedAnswer: string;
    confidence: number;
    reasoning: string;
    sources: string[];
    improvements: string[];
  };
  onRegenerate?: () => void;
}

export const EnhancedRemixResponse = ({ remixData, onRegenerate }: EnhancedRemixResponseProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-purple-200 rounded-lg p-4 bg-purple-50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-800">Enhanced Remix Response</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-purple-600">
            Confidence: {Math.round(remixData.confidence * 100)}%
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-purple-600 hover:text-purple-800"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-gray-800 leading-relaxed">{remixData.combinedAnswer}</p>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-4"
        >
          <div>
            <h4 className="font-semibold text-purple-700 mb-2">Reasoning</h4>
            <p className="text-sm text-gray-700">{remixData.reasoning}</p>
          </div>

          {remixData.sources.length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">Sources</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {remixData.sources.map((source, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {remixData.improvements.length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">Improvements Made</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {remixData.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {onRegenerate && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <button
            onClick={onRegenerate}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Regenerate Remix
          </button>
        </div>
      )}
    </motion.div>
  );
};
```

### 3.2 Multimodal Social Posts Component

**File: `components/MultimodalSocialPost.tsx`** (New)

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAISDK } from '@/hooks/useAISDK';

interface MultimodalSocialPostProps {
  content: string;
  platform: string;
  onImageGenerated?: (imageUrl: string) => void;
  onAudioGenerated?: (audioUrl: string) => void;
}

export const MultimodalSocialPost = ({
  content,
  platform,
  onImageGenerated,
  onAudioGenerated
}: MultimodalSocialPostProps) => {
  const aiSDK = useAISDK();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    try {
      const imageUrl = await aiSDK.generateImage(
        `Create a professional ${platform} image for: ${content}`
      );
      setGeneratedImage(imageUrl);
      onImageGenerated?.(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const handleGenerateAudio = async () => {
    try {
      const audioUrl = await aiSDK.generateSpeech(content);
      setGeneratedAudio(audioUrl);
      onAudioGenerated?.(audioUrl);
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-gray-200 rounded-lg p-4 bg-white"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {platform.charAt(0).toUpperCase() + platform.slice(1)} Post
        </h3>
        <p className="text-gray-700">{content}</p>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleGenerateImage}
          disabled={aiSDK.isGeneratingMultimodal}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {aiSDK.isGeneratingMultimodal ? 'Generating...' : 'Generate Image'}
        </button>
        <button
          onClick={handleGenerateAudio}
          disabled={aiSDK.isGeneratingMultimodal}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {aiSDK.isGeneratingMultimodal ? 'Generating...' : 'Generate Audio'}
        </button>
      </div>

      {generatedImage && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Generated Image</h4>
          <img
            src={generatedImage}
            alt="Generated for social post"
            className="w-full max-w-md rounded-lg"
          />
        </div>
      )}

      {generatedAudio && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Generated Audio</h4>
          <audio controls className="w-full">
            <source src={generatedAudio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {aiSDK.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{aiSDK.error}</p>
          <button
            onClick={aiSDK.clearError}
            className="mt-2 text-red-600 hover:text-red-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
};
```

## 📋 Phase 4: Integration & Testing (Week 4)

### 4.1 Update Main Components

**File: `components/RemixMessages.tsx`** (Update)

```typescript
// Add import for enhanced remix component
import { EnhancedRemixResponse } from './EnhancedRemixResponse';

// Update the component to use structured remix data
export const RemixMessages = ({ /* existing props */ }) => {
  // ... existing logic ...

  return (
    <div>
      {remixResponses.map((response, index) => (
        <div key={index}>
          {response.structured ? (
            <EnhancedRemixResponse
              remixData={response.data}
              onRegenerate={() => handleRemix(remixModels[index])}
            />
          ) : (
            // Fallback to existing simple response display
            <div className="border border-gray-200 rounded-lg p-4">
              <p>{response}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 4.2 Update Social Posts Drawer

**File: `components/SocialPostsDrawer.tsx`** (Update)

```typescript
// Add import for multimodal component
import { MultimodalSocialPost } from './MultimodalSocialPost';

// Update the component to include multimodal options
export const SocialPostsDrawer = ({ /* existing props */ }) => {
  // ... existing logic ...

  return (
    <div>
      {/* ... existing UI ... */}

      {/* Add multimodal options */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Multimodal Options</h3>
        <div className="space-y-4">
          {generatedPosts.map((post, index) => (
            <MultimodalSocialPost
              key={index}
              content={post.content}
              platform={post.platform}
              onImageGenerated={(imageUrl) => {
                // Handle image generation
              }}
              onAudioGenerated={(audioUrl) => {
                // Handle audio generation
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 📋 Phase 5: Advanced Features (Week 5)

### 5.1 Content Enhancement Tools

**File: `components/ContentEnhancer.tsx`** (New)

```typescript
'use client';

import { useState } from 'react';
import { useAISDK } from '@/hooks/useAISDK';

interface ContentEnhancerProps {
  content: string;
  model: string;
  onEnhanced?: (enhancedContent: string) => void;
}

export const ContentEnhancer = ({ content, model, onEnhanced }: ContentEnhancerProps) => {
  const aiSDK = useAISDK();
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);

  const handleEnhance = async () => {
    try {
      const result = await aiSDK.enhanceContent(content, model);
      setEnhancedContent(result);
      onEnhanced?.(result);
    } catch (error) {
      console.error('Error enhancing content:', error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Content Enhancement</h3>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Original Content</h4>
        <p className="text-gray-700 text-sm">{content}</p>
      </div>

      <button
        onClick={handleEnhance}
        disabled={aiSDK.isEnhancingContent}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {aiSDK.isEnhancingContent ? 'Enhancing...' : 'Enhance Content'}
      </button>

      {enhancedContent && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Enhanced Content</h4>
          <p className="text-gray-700 text-sm">{enhancedContent}</p>
        </div>
      )}

      {aiSDK.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{aiSDK.error}</p>
        </div>
      )}
    </div>
  );
};
```

### 5.2 Audio Transcription Component

**File: `components/AudioTranscriber.tsx`** (New)

```typescript
'use client';

import { useState, useRef } from 'react';
import { useAISDK } from '@/hooks/useAISDK';

export const AudioTranscriber = () => {
  const aiSDK = useAISDK();
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });

        try {
          const transcription = await aiSDK.transcribeAudio(audioFile);
          setTranscript(transcription);
        } catch (error) {
          console.error('Error transcribing audio:', error);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Audio Transcription</h3>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-md ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {transcript && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Transcription</h4>
          <p className="text-gray-700 text-sm">{transcript}</p>
        </div>
      )}

      {aiSDK.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{aiSDK.error}</p>
        </div>
      )}
    </div>
  );
};
```

## 🚀 Migration Checklist

### Phase 1: Core Infrastructure

- [ ] Create `lib/ai-sdk-service.ts`
- [ ] Update `app/api/chat/route.ts`
- [ ] Create `app/api/remix/route.ts`
- [ ] Create `app/api/multimodal/route.ts`
- [ ] Test basic AI SDK integration

### Phase 2: Enhanced Hooks

- [ ] Create `hooks/useAISDK.ts`
- [ ] Update `hooks/useEventHandlers.ts`
- [ ] Test enhanced remix functionality
- [ ] Test multimodal capabilities

### Phase 3: UI Enhancements

- [ ] Create `components/EnhancedRemixResponse.tsx`
- [ ] Create `components/MultimodalSocialPost.tsx`
- [ ] Update existing components to use new features
- [ ] Test UI components

### Phase 4: Integration & Testing

- [ ] Update `components/RemixMessages.tsx`
- [ ] Update `components/SocialPostsDrawer.tsx`
- [ ] Integration testing
- [ ] Performance testing

### Phase 5: Advanced Features

- [ ] Create `components/ContentEnhancer.tsx`
- [ ] Create `components/AudioTranscriber.tsx`
- [ ] Final testing and optimization
- [ ] Documentation updates

## 🎯 Benefits After Migration

1. **Enhanced Remix Quality**: Structured responses with confidence scores and reasoning
2. **Multi-Modal Content**: Image generation, speech synthesis, and audio transcription
3. **Better Error Handling**: Built-in retry logic and specific error types
4. **Content Enhancement**: Fact-checking and formatting tools
5. **Improved UX**: Rich UI components with loading states and error handling
6. **Future-Proof**: Easy to add new providers and capabilities

## 🔄 Rollback Plan

If issues arise during migration:

1. Keep existing API routes as fallbacks
2. Use feature flags to toggle between old and new implementations
3. Maintain backward compatibility in data structures
4. Gradual rollout with A/B testing

This migration plan provides a structured approach to enhance your application with Vercel AI SDK's advanced capabilities while maintaining stability and user experience.
