import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { geminiService, ChatRequest } from '@/lib/gemini';
import { AISDKService } from '@/lib/ai-sdk-service';

// Check if we should use mock API
const USE_MOCK_API = process.env.USE_MOCK_API === 'true';

// Mock response generator
function generateMockResponse(prompt: string, modelId: string): string {
  const responses = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
  ];

  // Use modelId and prompt to generate a consistent but varied response
  const hash = prompt.length + modelId.length;
  const mockResponseIndex = hash % responses.length;
  return `${responses[mockResponseIndex]} (Mock response from ${modelId})`;
}

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
      context: {
        ...body.context,
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
          const basePrompt = body.context?.systemPrompt || '';
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

    console.log(`API: Using ${USE_MOCK_API ? 'MOCK' : 'REAL'} API`);

    if (USE_MOCK_API) {
      // Mock response instead of real AI call
      const mockResponse = generateMockResponse(
        body.messages[body.messages.length - 1].content,
        chatRequest.model,
      );

      // Simulate streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send the mock response in chunks to simulate streaming
          const chunks = mockResponse.split(' ');
          let index = 0;

          const sendChunk = () => {
            if (index < chunks.length) {
              const chunk = chunks[index] + (index < chunks.length - 1 ? ' ' : '');
              const data = {
                success: true,
                data: {
                  content: chunk,
                  model: chatRequest.model,
                },
              };

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              index++;

              // Simulate realistic timing
              setTimeout(sendChunk, Math.random() * 50 + 20);
            } else {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            }
          };

          sendChunk();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      // Use real Gemini service
      try {
        // Check if we have file attachments
        const attachments = body.attachments || [];

        const response = await geminiService.sendMessage(chatRequest);

        // Convert the response to a streaming format
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            // Split the response into words for streaming
            const words = response.content.split(' ');
            let index = 0;

            // Use shorter delay for longer responses (like remix)
            const delay = words.length > 50 ? 15 : 25;

            const sendNextWord = () => {
              if (index < words.length) {
                const word = words[index] + (index < words.length - 1 ? ' ' : '');
                const data = {
                  success: true,
                  data: {
                    content: word,
                    model: chatRequest.model,
                  },
                };

                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                index++;

                // Send next word after a shorter delay for better streaming
                setTimeout(sendNextWord, delay);
              } else {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              }
            };

            sendNextWord();
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      } catch (error) {
        console.error('Gemini Service Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
          },
          { status: 500 },
        );
      }
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
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
