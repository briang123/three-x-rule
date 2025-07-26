import { NextRequest, NextResponse } from 'next/server';
import { geminiService, ChatRequest } from '@/lib/gemini';

// In-memory conversation store (in production, use a proper database)
const conversationStore = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Enhanced validation
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Messages array is required and cannot be empty',
        },
        { status: 400 },
      );
    }

    // Extract conversation ID for context management
    const conversationId = body.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get existing conversation context if available
    const existingConversation = conversationStore.get(conversationId);
    
    // Merge context from existing conversation and new request
    const mergedContext = {
      ...existingConversation?.context,
      ...body.context,
      // Merge system prompts if both exist
      systemPrompt: body.context?.systemPrompt || existingConversation?.context?.systemPrompt,
    };

    // Build the complete chat request
    const chatRequest: ChatRequest = {
      messages: body.messages,
      model: body.model || 'gemini-2.0-flash',
      context: mergedContext,
      temperature: body.temperature || 0.7,
      maxTokens: body.maxTokens,
      topP: body.topP,
      topK: body.topK,
    };

    // Send message to Gemini
    const response = await geminiService.sendMessage(chatRequest);

    // Store conversation for future reference
    conversationStore.set(conversationId, {
      context: mergedContext,
      lastMessage: body.messages[body.messages.length - 1],
      lastResponse: response,
      timestamp: new Date().toISOString(),
      messageCount: (existingConversation?.messageCount || 0) + 1,
    });

    // Clean up old conversations (keep only last 100)
    if (conversationStore.size > 100) {
      const entries = Array.from(conversationStore.entries());
      entries.slice(0, entries.length - 100).forEach(([key]) => {
        conversationStore.delete(key);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...response,
        conversationId,
        messageCount: conversationStore.get(conversationId)?.messageCount || 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Advanced Chat API error:', error);

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

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversation ID is required',
        },
        { status: 400 },
      );
    }

    const conversation = conversationStore.get(conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversation not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        context: conversation.context,
        lastMessage: conversation.lastMessage,
        lastResponse: conversation.lastResponse,
        timestamp: conversation.timestamp,
        messageCount: conversation.messageCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get conversation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve conversation',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Delete conversation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversation ID is required',
        },
        { status: 400 },
      );
    }

    const deleted = conversationStore.delete(conversationId);

    return NextResponse.json({
      success: true,
      data: {
        deleted,
        conversationId,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Delete conversation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete conversation',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
} 