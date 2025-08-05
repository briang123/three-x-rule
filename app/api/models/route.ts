import { NextRequest, NextResponse } from 'next/server';
import { AISDKService } from '@/lib/ai-sdk-service';
import { z } from 'zod';

// Request validation schema
const ModelsRequestSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  apiKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedRequest = ModelsRequestSchema.parse(body);

    const models = await AISDKService.getAvailableModels(
      validatedRequest.providerId,
      validatedRequest.apiKey,
    );

    return NextResponse.json({
      success: true,
      data: {
        providerId: validatedRequest.providerId,
        models,
        count: models.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Models API Error:', error);

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
    message: 'Models API endpoint is available',
    usage: {
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
    },
    supportedProviders: ['gemini'],
    timestamp: new Date().toISOString(),
  });
}
