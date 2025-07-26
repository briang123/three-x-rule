import { NextRequest, NextResponse } from 'next/server';
import { geminiService, ChatRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Enhanced validation with better error messages
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Messages array is required and cannot be empty',
        },
        { status: 400 },
      );
    }

    // Validate the request body
    const chatRequest: ChatRequest = {
      messages: body.messages,
      model: body.model || 'gemini-2.0-flash',
      context: body.context,
      temperature: body.temperature || 0.7,
      maxTokens: body.maxTokens,
      topP: body.topP,
      topK: body.topK,
    };

    // Check if streaming is requested
    const shouldStream = body.stream === true;
    
    if (shouldStream) {
      // Return streaming response
      return streamResponse(chatRequest);
    }

    // Send message to Gemini
    const response = await geminiService.sendMessage(chatRequest);

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Streaming response function
async function streamResponse(chatRequest: ChatRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // For now, we'll send the full response as a single chunk
        // In a real implementation, you'd want to use Gemini's streaming API
        const response = await geminiService.sendMessage(chatRequest);
        
        const chunk = encoder.encode(
          `data: ${JSON.stringify({
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
          })}\n\n`
        );
        
        controller.enqueue(chunk);
        controller.close();
      } catch (error) {
        const errorChunk = encoder.encode(
          `data: ${JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          })}\n\n`
        );
        
        controller.enqueue(errorChunk);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function GET() {
  try {
    // Return available models with enhanced information
    const models = geminiService.getAvailableModels();
    const modelInfo = models.map((model) => ({
      id: model,
      ...geminiService.getModelInfo(model),
    }));

    return NextResponse.json({
      success: true,
      data: {
        models: modelInfo,
        totalModels: models.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Models API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch models',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
