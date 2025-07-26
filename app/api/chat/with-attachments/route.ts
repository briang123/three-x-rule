import { NextRequest, NextResponse } from 'next/server';
import { geminiService, ChatRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    console.log('API: Starting request processing');
    // Parse the multipart form data
    const formData = await request.formData();
    console.log('API: FormData parsed successfully');

    // Extract the JSON data
    const jsonData = formData.get('jsonData') as string;
    console.log('API: JSON data extracted:', jsonData ? 'present' : 'missing');
    if (!jsonData) {
      return NextResponse.json(
        {
          success: false,
          error: 'JSON data is required',
        },
        { status: 400 },
      );
    }

    const body = JSON.parse(jsonData);
    console.log('API: Request body parsed:', JSON.stringify(body, null, 2));

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

    // Process file attachments
    const files: Array<{ name: string; content: string; mimeType: string }> = [];
    const images: string[] = [];

    console.log('API: Processing form data entries...');
    for (const [key, value] of Array.from(formData.entries())) {
      console.log(
        `API: Form data key: ${key}, type: ${typeof value}, isFile: ${value && typeof value === 'object' && 'name' in value && 'size' in value && 'type' in value}`,
      );
      console.log(`API: Value properties:`, value ? Object.keys(value) : 'null/undefined');
      if (
        key.startsWith('file-') &&
        value &&
        typeof value === 'object' &&
        'name' in value &&
        'size' in value &&
        'type' in value
      ) {
        const file = value as any;

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            {
              success: false,
              error: `File ${file.name} is too large. Maximum size is 10MB.`,
            },
            { status: 400 },
          );
        }

        // Read file content
        const buffer = await file.arrayBuffer();
        const content = Buffer.from(buffer).toString('base64');

        // Determine if it's an image
        if (file.type.startsWith('image/')) {
          images.push(content);
          console.log(`API: Added image: ${file.name}`);
        } else {
          // For text files, markdown files, and PDFs, try to decode as text
          let textContent = '';
          try {
            textContent = Buffer.from(buffer).toString('utf-8');
          } catch (error) {
            // If it's not valid UTF-8, use base64
            textContent = content;
          }

          // For PDFs, we might want to add a note that it's binary content
          if (file.type === 'application/pdf') {
            textContent = `[PDF Binary Content - Base64 Encoded]\n${content}`;
          }

          // For markdown files, we can add a note that it's markdown content
          if (file.type === 'text/markdown') {
            textContent = `[Markdown Content]\n${textContent}`;
          }

          files.push({
            name: file.name,
            content: textContent,
            mimeType: file.type,
          });
          console.log(`API: Added file: ${file.name} (${file.type})`);
        }
      }

      console.log(`API: Processed ${files.length} text files and ${images.length} images`);
    }

    // Validate the request body
    const chatRequest: ChatRequest = {
      messages: body.messages,
      model: body.model || 'gemini-2.0-flash',
      context: {
        ...body.context,
        files: files.length > 0 ? files : undefined,
        images: images.length > 0 ? images : undefined,
        systemPrompt: (() => {
          const now = new Date();
          const dateString = now.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
          // Try to get timezone from request, fallback to UTC
          let userTimezone = 'UTC';
          if (body.timezone) {
            userTimezone = body.timezone;
          } else if (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions) {
            userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          }

          let basePrompt = body.context?.systemPrompt || '';

          // Add file context to system prompt
          if (files.length > 0) {
            const fileContext = files
              .map((file) => `File: ${file.name}\nContent:\n${file.content}`)
              .join('\n\n');
            basePrompt += `\n\nAttached files:\n${fileContext}`;
          }

          return (
            `Today's date and time: ${dateString}\nUser timezone: ${userTimezone}` +
            (basePrompt ? `\n\n${basePrompt}` : '')
          );
        })(),
      },
      temperature: body.temperature || 0.7,
      maxTokens: body.maxTokens,
      topP: body.topP,
      topK: body.topK,
    };

    // Check if streaming is requested
    const shouldStream = body.stream === true;

    if (shouldStream) {
      // Return streaming response
      return streamResponse(chatRequest, images.length > 0);
    }

    // Send message to Gemini
    let response;
    if (images.length > 0) {
      // Use the image-aware method
      response = await geminiService.sendMessageWithImages({
        messages: chatRequest.messages,
        model: chatRequest.model,
        temperature: chatRequest.temperature,
        maxTokens: chatRequest.maxTokens,
        topP: chatRequest.topP,
        topK: chatRequest.topK,
        context: {
          text: chatRequest.context?.text,
          images: images,
          systemPrompt: chatRequest.context?.systemPrompt,
        },
      });
    } else {
      // Use the regular method
      response = await geminiService.sendMessage(chatRequest);
    }

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat with attachments API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

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
async function streamResponse(chatRequest: ChatRequest, hasImages: boolean) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send the full response as a single chunk for now
        // TODO: Implement proper streaming with Gemini's streaming API
        let response;
        if (hasImages) {
          response = await geminiService.sendMessageWithImages({
            messages: chatRequest.messages,
            model: chatRequest.model,
            temperature: chatRequest.temperature,
            maxTokens: chatRequest.maxTokens,
            topP: chatRequest.topP,
            topK: chatRequest.topK,
            context: {
              text: chatRequest.context?.text,
              images: chatRequest.context?.images || [],
              systemPrompt: chatRequest.context?.systemPrompt,
            },
          });
        } else {
          response = await geminiService.sendMessage(chatRequest);
        }

        const chunk = encoder.encode(
          `data: ${JSON.stringify({
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
          })}\n\n`,
        );

        controller.enqueue(chunk);

        // Send the done signal
        const doneChunk = encoder.encode('data: [DONE]\n\n');
        controller.enqueue(doneChunk);
        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        const errorChunk = encoder.encode(
          `data: ${JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          })}\n\n`,
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
      Connection: 'keep-alive',
    },
  });
}
