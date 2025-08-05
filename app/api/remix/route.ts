import { NextRequest, NextResponse } from 'next/server';
import { AISDKService } from '@/lib/ai-sdk-service';
import { z } from 'zod';

// Request validation schema
const RemixRequestSchema = z.object({
  originalPrompt: z.string().min(1, 'Original prompt is required'),
  responses: z.array(z.string()).min(1, 'At least one response is required'),
  model: z.string().default('gemini-2.0-flash'),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedRequest = RemixRequestSchema.parse(body);

    const remixResult = await AISDKService.generateStructuredRemix(
      validatedRequest.originalPrompt,
      validatedRequest.responses,
      validatedRequest.model,
    );

    return NextResponse.json({
      success: true,
      data: remixResult,
      model: validatedRequest.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Remix API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    const errorMessage = AISDKService.getErrorMessage(error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Remix API endpoint is available',
    usage: {
      method: 'POST',
      body: {
        originalPrompt: 'string (required)',
        responses: 'string[] (required)',
        model: 'string (optional, default: gemini-2.0-flash)',
        temperature: 'number (optional, 0-2)',
        maxTokens: 'number (optional, 1-8192)',
      },
      response: {
        success: 'boolean',
        data: {
          combinedAnswer: 'string',
          confidence: 'number (0-1)',
          reasoning: 'string',
          sources: 'string[]',
          improvements: 'string[]',
        },
        model: 'string',
        timestamp: 'string',
      },
    },
    timestamp: new Date().toISOString(),
  });
}
