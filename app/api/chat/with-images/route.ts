import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body for image chat
    const chatRequest = {
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

    // Validate that images are provided
    if (!chatRequest.context.images || chatRequest.context.images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one image is required for image chat',
        },
        { status: 400 },
      );
    }

    // Send message with images to Gemini
    const response = await geminiService.sendMessageWithImages(chatRequest);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Image chat API error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
