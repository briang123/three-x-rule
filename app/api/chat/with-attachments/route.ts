import { NextRequest, NextResponse } from 'next/server';
import { geminiService, ChatRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const model = (formData.get('model') as string) || 'gemini-2.0-flash';
    const files = formData.getAll('files') as File[];

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is required',
        },
        { status: 400 },
      );
    }

    // Process files and convert to base64 if they are images
    const processedFiles: string[] = [];
    const textFiles: string[] = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Convert image to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = file.type;
        processedFiles.push(`data:${mimeType};base64,${base64}`);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // Read text file content
        const text = await file.text();
        textFiles.push(text);
      }
    }

    // Create context with text files and images
    const context: any = {};
    if (textFiles.length > 0) {
      context.text = textFiles.join('\n\n');
    }
    if (processedFiles.length > 0) {
      context.images = processedFiles;
    }

    // Create chat request
    const chatRequest: ChatRequest = {
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model as any,
      context: Object.keys(context).length > 0 ? context : undefined,
      temperature: 0.7,
    };

    // Send message to Gemini
    const response = await geminiService.sendMessage(chatRequest);

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat with attachments API error:', error);

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
