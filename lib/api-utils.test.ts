import { handleStreamResponse, sendChatRequest } from './api-utils';

// Mock fetch globally
global.fetch = jest.fn();

describe('sendChatRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send a POST request to /api/chat without attachments', async () => {
    const mockResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const prompt = 'Test prompt';
    const model = 'gpt-4';

    await sendChatRequest(prompt, model);

    expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model,
        stream: true,
      }),
    });
  });

  it('should send a POST request to /api/chat/with-attachments when attachments are provided', async () => {
    const mockResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const prompt = 'Test prompt';
    const model = 'gpt-4';
    const attachments = [
      new File(['test content'], 'test.txt', { type: 'text/plain' }),
      new File(['image content'], 'image.jpg', { type: 'image/jpeg' }),
    ];

    await sendChatRequest(prompt, model, attachments);

    expect(global.fetch).toHaveBeenCalledWith('/api/chat/with-attachments', {
      method: 'POST',
      body: expect.any(FormData),
    });

    const formData = (global.fetch as jest.Mock).mock.calls[0][1].body;
    expect(formData.get('jsonData')).toBe(
      JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model,
        stream: true,
      }),
    );
    expect(formData.get('file-0')).toBe(attachments[0]);
    expect(formData.get('file-1')).toBe(attachments[1]);
  });

  it('should handle empty attachments array', async () => {
    const mockResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const prompt = 'Test prompt';
    const model = 'gpt-4';
    const attachments: File[] = [];

    await sendChatRequest(prompt, model, attachments);

    expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model,
        stream: true,
      }),
    });
  });

  it('should handle undefined attachments', async () => {
    const mockResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const prompt = 'Test prompt';
    const model = 'gpt-4';

    await sendChatRequest(prompt, model, undefined);

    expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model,
        stream: true,
      }),
    });
  });
});

describe('handleStreamResponse', () => {
  let mockReader: any;
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReader = {
      read: jest.fn(),
    };

    mockResponse = {
      ok: true,
      body: {
        getReader: jest.fn().mockReturnValue(mockReader),
      },
    };
  });

  it('should handle successful stream response', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    // Mock successful stream data
    mockReader.read
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: {"success":true,"data":{"content":"Hello"}}\n'),
      })
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: {"success":true,"data":{"content":" World"}}\n'),
      })
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: [DONE]\n'),
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined,
      });

    await handleStreamResponse(mockResponse, onChunk, onComplete);

    expect(onChunk).toHaveBeenCalledWith('Hello');
    expect(onChunk).toHaveBeenCalledWith(' World');
    expect(onComplete).toHaveBeenCalledWith('Hello World');
  });

  it('should handle response with error status', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    mockResponse.ok = false;
    mockResponse.text = jest.fn().mockResolvedValue('Error message');

    await expect(handleStreamResponse(mockResponse, onChunk, onComplete)).rejects.toThrow(
      'HTTP error! status: undefined - Error message',
    );

    expect(onChunk).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should handle response without body', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    mockResponse.body = null;

    await expect(handleStreamResponse(mockResponse, onChunk, onComplete)).rejects.toThrow(
      'No response body',
    );

    expect(onChunk).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should handle malformed JSON in stream', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    mockReader.read
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: {"invalid json\n'),
      })
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: {"success":true,"data":{"content":"Valid"}}\n'),
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined,
      });

    await handleStreamResponse(mockResponse, onChunk, onComplete);

    expect(onChunk).toHaveBeenCalledWith('Valid');
    expect(onComplete).toHaveBeenCalledWith('Valid');
  });

  it('should handle multiple lines in single chunk', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    mockReader.read
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode(
          'data: {"success":true,"data":{"content":"Hello"}}\ndata: {"success":true,"data":{"content":" World"}}\n',
        ),
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined,
      });

    await handleStreamResponse(mockResponse, onChunk, onComplete);

    expect(onChunk).toHaveBeenCalledWith('Hello');
    expect(onChunk).toHaveBeenCalledWith(' World');
    expect(onComplete).toHaveBeenCalledWith('Hello World');
  });

  it('should handle empty data lines', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    mockReader.read
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: \n'),
      })
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: {"success":true,"data":{"content":"Valid"}}\n'),
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined,
      });

    await handleStreamResponse(mockResponse, onChunk, onComplete);

    expect(onChunk).toHaveBeenCalledWith('Valid');
    expect(onComplete).toHaveBeenCalledWith('Valid');
  });

  it('should handle non-data lines', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    mockReader.read
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('not-data: line\n'),
      })
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: {"success":true,"data":{"content":"Valid"}}\n'),
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined,
      });

    await handleStreamResponse(mockResponse, onChunk, onComplete);

    expect(onChunk).toHaveBeenCalledWith('Valid');
    expect(onComplete).toHaveBeenCalledWith('Valid');
  });

  it('should handle stream with no content in data', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    mockReader.read
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: {"success":true,"data":{}}\n'),
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined,
      });

    await handleStreamResponse(mockResponse, onChunk, onComplete);

    expect(onChunk).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith('');
  });

  it('should handle stream with null content', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    mockReader.read
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: {"success":true,"data":{"content":null}}\n'),
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined,
      });

    await handleStreamResponse(mockResponse, onChunk, onComplete);

    expect(onChunk).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith('');
  });

  it('should handle stream with unsuccessful response', async () => {
    const onChunk = jest.fn();
    const onComplete = jest.fn();

    mockReader.read
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode('data: {"success":false,"error":"API Error"}\n'),
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined,
      });

    await handleStreamResponse(mockResponse, onChunk, onComplete);

    expect(onChunk).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith('');
  });
});
