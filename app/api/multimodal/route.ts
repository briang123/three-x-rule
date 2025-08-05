import { NextRequest, NextResponse } from 'next/server';
import { AISDKService } from '@/lib/ai-sdk-service';
import { z } from 'zod';

// Request validation schema
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
      // Image-specific options
      size: z.enum(['256x256', '512x512', '1024x1024']).optional(),
      quality: z.enum(['standard', 'hd']).optional(),
      // Speech-specific options
      voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
      speed: z.number().min(0.25).max(4.0).optional(),
      // Transcription-specific options
      language: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedRequest = MultimodalRequestSchema.parse(body);

    let result;
    const model = validatedRequest.model || 'gemini-2.0-flash';

    switch (validatedRequest.type) {
      case 'image':
        result = await AISDKService.generateImage(validatedRequest.prompt);
        break;
      case 'speech':
        result = await AISDKService.generateSpeech(validatedRequest.prompt);
        break;
      case 'transcribe':
        // For transcription, we need to handle file upload
        // This would typically be handled via FormData
        return NextResponse.json(
          {
            success: false,
            error: 'Transcription requires file upload. Use multipart/form-data.',
          },
          { status: 400 },
        );
      default:
        throw new Error('Unsupported multimodal type');
    }

    return NextResponse.json({
      success: true,
      data: result,
      type: validatedRequest.type,
      model,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Multimodal API Error:', error);

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

// Handle file uploads for transcription
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const model = (formData.get('model') as string) || 'whisper-1';

    if (!audioFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Audio file is required',
        },
        { status: 400 },
      );
    }

    const transcription = await AISDKService.transcribeAudio(audioFile);

    return NextResponse.json({
      success: true,
      data: transcription,
      type: 'transcribe',
      model,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Transcription API Error:', error);
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
    message: 'Multimodal API endpoint is available',
    capabilities: {
      image: {
        description: 'Generate images from text prompts',
        method: 'POST',
        body: {
          type: 'image',
          prompt: 'string (required)',
          model: 'string (optional)',
          options: {
            size: 'string (256x256, 512x512, 1024x1024)',
            quality: 'string (standard, hd)',
          },
        },
      },
      speech: {
        description: 'Generate speech from text',
        method: 'POST',
        body: {
          type: 'speech',
          prompt: 'string (required)',
          model: 'string (optional)',
          options: {
            voice: 'string (alloy, echo, fable, onyx, nova, shimmer)',
            speed: 'number (0.25-4.0)',
          },
        },
      },
      transcribe: {
        description: 'Transcribe audio files',
        method: 'PUT',
        body: 'FormData with audio file',
        formData: {
          audio: 'File (required)',
          model: 'string (optional)',
        },
      },
    },
    timestamp: new Date().toISOString(),
  });
}
