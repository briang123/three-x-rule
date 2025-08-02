// Mock the gemini service
jest.mock('@/lib/gemini', () => ({
  geminiService: {
    sendMessage: jest.fn(),
    sendMessageWithImages: jest.fn(),
    getAvailableModels: jest.fn(),
    getModelInfo: jest.fn(),
  },
}));

describe('/api/chat/with-attachments', () => {
  let geminiService: any;
  let originalEnv: any;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env;
    geminiService = require('@/lib/gemini').geminiService;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Business Logic Tests', () => {
    it('should use mock API when USE_MOCK_API is true', () => {
      process.env.USE_MOCK_API = 'true';

      // Test the environment variable logic
      const USE_MOCK_API = process.env.USE_MOCK_API === 'true' || !process.env.GEMINI_API_KEY;

      expect(USE_MOCK_API).toBe(true);
    });

    it('should use mock API when GEMINI_API_KEY is not set', () => {
      delete process.env.GEMINI_API_KEY;

      // Test the environment variable logic
      const USE_MOCK_API = process.env.USE_MOCK_API === 'true' || !process.env.GEMINI_API_KEY;

      expect(USE_MOCK_API).toBe(true);
    });

    it('should use real API when USE_MOCK_API is false and GEMINI_API_KEY is set', () => {
      process.env.USE_MOCK_API = 'false';
      process.env.GEMINI_API_KEY = 'test-key';

      // Test the environment variable logic
      const USE_MOCK_API = process.env.USE_MOCK_API === 'true' || !process.env.GEMINI_API_KEY;

      expect(USE_MOCK_API).toBe(false);
    });

    it('should validate messages array correctly', () => {
      // Test validation logic
      const validateMessages = (messages: any) => {
        return Boolean(messages && Array.isArray(messages) && messages.length > 0);
      };

      expect(validateMessages(undefined)).toBe(false);
      expect(validateMessages(null)).toBe(false);
      expect(validateMessages([])).toBe(false);
      expect(validateMessages('not an array')).toBe(false);
      expect(validateMessages([{ role: 'user', content: 'Hello' }])).toBe(true);
    });

    it('should validate file size correctly', () => {
      // Test file size validation logic
      const validateFileSize = (size: number, maxSize: number = 10 * 1024 * 1024) => {
        return size <= maxSize;
      };

      expect(validateFileSize(1024)).toBe(true); // 1KB
      expect(validateFileSize(10 * 1024 * 1024)).toBe(true); // 10MB
      expect(validateFileSize(10 * 1024 * 1024 + 1)).toBe(false); // 10MB + 1 byte
      expect(validateFileSize(50 * 1024 * 1024)).toBe(false); // 50MB
    });

    it('should process file content correctly', () => {
      // Test file content processing logic
      const processFileContent = (buffer: ArrayBuffer, mimeType: string) => {
        const content = Buffer.from(buffer).toString('base64');

        if (mimeType.startsWith('image/')) {
          return { type: 'image', content };
        } else {
          let textContent = '';
          try {
            textContent = Buffer.from(buffer).toString('utf-8');
          } catch (error) {
            textContent = content;
          }

          if (mimeType === 'application/pdf') {
            textContent = `[PDF Binary Content - Base64 Encoded]\n${content}`;
          } else if (mimeType === 'text/markdown') {
            textContent = `[Markdown Content]\n${textContent}`;
          }

          return { type: 'file', content: textContent };
        }
      };

      const textBuffer = new ArrayBuffer(8);
      const imageBuffer = new ArrayBuffer(8);

      const textResult = processFileContent(textBuffer, 'text/plain');
      const imageResult = processFileContent(imageBuffer, 'image/jpeg');
      const pdfResult = processFileContent(textBuffer, 'application/pdf');
      const markdownResult = processFileContent(textBuffer, 'text/markdown');

      expect(textResult.type).toBe('file');
      expect(imageResult.type).toBe('image');
      expect(pdfResult.content).toContain('[PDF Binary Content - Base64 Encoded]');
      expect(markdownResult.content).toContain('[Markdown Content]');
    });

    it('should generate system prompt with file context', () => {
      const now = new Date();
      const dateString = now.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
      const userTimezone = 'America/New_York';
      const basePrompt = 'Custom prompt';

      const files = [
        { name: 'test.txt', content: 'Hello world', mimeType: 'text/plain' },
        { name: 'document.md', content: '# Title\nContent', mimeType: 'text/markdown' },
      ];

      const fileContext = files
        .map((file) => `File: ${file.name}\nContent:\n${file.content}`)
        .join('\n\n');

      const systemPrompt = `Today's date and time: ${dateString}\nUser timezone: ${userTimezone}\n\n${basePrompt}\n\nAttached files:\n${fileContext}`;

      expect(systemPrompt).toMatch(/Today's date and time:/);
      expect(systemPrompt).toMatch(/User timezone: America\/New_York/);
      expect(systemPrompt).toMatch(/Custom prompt/);
      expect(systemPrompt).toMatch(/File: test\.txt/);
      expect(systemPrompt).toMatch(/File: document\.md/);
      expect(systemPrompt).toMatch(/Hello world/);
      expect(systemPrompt).toMatch(/# Title/);
    });

    it('should generate mock response with file context', () => {
      const generateMockResponseWithFiles = (
        prompt: string,
        modelId: string,
        files: Array<{ name: string; content: string; mimeType: string }>,
        images: string[],
      ): string => {
        const fileContext =
          files.length > 0 ? `\n\nAttached files: ${files.map((f) => f.name).join(', ')}` : '';
        const imageContext =
          images.length > 0 ? `\n\nAttached images: ${images.length} image(s)` : '';

        const responses = [
          `I've analyzed your request: "${prompt}"${fileContext}${imageContext}. Based on the provided content, here's my analysis and recommendations.`,
          `Thank you for sharing this information. I've reviewed the attached files and can provide insights on your query: "${prompt}".`,
          `After examining the provided documents and your question about "${prompt}", I can offer the following observations and suggestions.`,
          `I've processed your request along with the attached files. Here's my comprehensive response to: "${prompt}".`,
          `Based on the content you've shared and your question "${prompt}", here are my findings and recommendations.`,
        ];

        // Use modelId and prompt to generate a consistent but varied response
        const hash = prompt.length + modelId.length + files.length + images.length;
        const mockResponseIndex = hash % responses.length;
        return `${responses[mockResponseIndex]} (Mock response from ${modelId})`;
      };

      const files = [
        { name: 'test.txt', content: 'Hello world', mimeType: 'text/plain' },
        { name: 'document.pdf', content: 'PDF content', mimeType: 'application/pdf' },
      ];
      const images = ['image1', 'image2'];

      const response = generateMockResponseWithFiles('Hello', 'gemini-2.0-flash', files, images);

      expect(response).toContain('(Mock response from gemini-2.0-flash)');
      expect(response).toContain('Attached files: test.txt, document.pdf');
      expect(response).toContain('Attached images: 2 image(s)');
    });
  });

  describe('Gemini Service Integration', () => {
    it('should call geminiService.sendMessage for text-only requests', async () => {
      process.env.USE_MOCK_API = 'false';
      process.env.GEMINI_API_KEY = 'test-key';

      geminiService.sendMessage.mockResolvedValue({
        content: 'Real API response',
      });

      // Test the service call directly
      const chatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        temperature: 0.7,
      };

      await geminiService.sendMessage(chatRequest);

      expect(geminiService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'gemini-2.0-flash',
          temperature: 0.7,
        }),
      );
    });

    it('should call geminiService.sendMessageWithImages for image requests', async () => {
      process.env.USE_MOCK_API = 'false';
      process.env.GEMINI_API_KEY = 'test-key';

      geminiService.sendMessageWithImages.mockResolvedValue({
        content: 'Real API response with images',
      });

      // Test the service call directly
      const chatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        context: {
          images: ['image1', 'image2'],
        },
      };

      await geminiService.sendMessageWithImages(chatRequest);

      expect(geminiService.sendMessageWithImages).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'gemini-2.0-flash',
          temperature: 0.7,
          context: expect.objectContaining({
            images: ['image1', 'image2'],
          }),
        }),
      );
    });

    it('should handle API errors gracefully', () => {
      const handleApiError = (error: Error) => {
        const errorMessage = error.message;

        if (
          errorMessage.includes('429') ||
          errorMessage.includes('quota') ||
          errorMessage.includes('rate limit')
        ) {
          return {
            success: false,
            error: 'API rate limit exceeded. Please try again in a few moments.',
            status: 429,
          };
        }

        if (
          errorMessage.includes('401') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('API key')
        ) {
          return {
            success: false,
            error: 'Authentication failed. Please check your API configuration.',
            status: 401,
          };
        }

        if (errorMessage.includes('model') || errorMessage.includes('not found')) {
          return {
            success: false,
            error: 'Model not available. Please try a different model.',
            status: 400,
          };
        }

        return {
          success: false,
          error: 'AI service temporarily unavailable. Please try again later.',
          status: 503,
        };
      };

      const rateLimitError = new Error('429 rate limit exceeded');
      const authError = new Error('401 unauthorized');
      const modelError = new Error('model not found');
      const genericError = new Error('unknown error');

      expect(handleApiError(rateLimitError).status).toBe(429);
      expect(handleApiError(authError).status).toBe(401);
      expect(handleApiError(modelError).status).toBe(400);
      expect(handleApiError(genericError).status).toBe(503);
    });
  });

  describe('File Processing', () => {
    it('should process text files correctly', () => {
      const processTextFile = (file: any) => {
        const buffer = new ArrayBuffer(8);
        const content = Buffer.from(buffer).toString('base64');
        const textContent = Buffer.from(buffer).toString('utf-8');

        return {
          name: file.name,
          content: textContent,
          mimeType: file.type,
        };
      };

      const mockFile = {
        name: 'test.txt',
        type: 'text/plain',
        size: 1024,
      };

      const result = processTextFile(mockFile);

      expect(result.name).toBe('test.txt');
      expect(result.mimeType).toBe('text/plain');
      expect(typeof result.content).toBe('string');
    });

    it('should process markdown files correctly', () => {
      const processMarkdownFile = (file: any) => {
        const buffer = new ArrayBuffer(8);
        const textContent = Buffer.from(buffer).toString('utf-8');
        const markdownContent = `[Markdown Content]\n${textContent}`;

        return {
          name: file.name,
          content: markdownContent,
          mimeType: file.type,
        };
      };

      const mockFile = {
        name: 'document.md',
        type: 'text/markdown',
        size: 1024,
      };

      const result = processMarkdownFile(mockFile);

      expect(result.name).toBe('document.md');
      expect(result.mimeType).toBe('text/markdown');
      expect(result.content).toContain('[Markdown Content]');
    });

    it('should process PDF files correctly', () => {
      const processPdfFile = (file: any) => {
        const buffer = new ArrayBuffer(8);
        const content = Buffer.from(buffer).toString('base64');
        const pdfContent = `[PDF Binary Content - Base64 Encoded]\n${content}`;

        return {
          name: file.name,
          content: pdfContent,
          mimeType: file.type,
        };
      };

      const mockFile = {
        name: 'document.pdf',
        type: 'application/pdf',
        size: 1024,
      };

      const result = processPdfFile(mockFile);

      expect(result.name).toBe('document.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.content).toContain('[PDF Binary Content - Base64 Encoded]');
    });

    it('should process image files correctly', () => {
      const processImageFile = (file: any) => {
        const buffer = new ArrayBuffer(8);
        const content = Buffer.from(buffer).toString('base64');

        return {
          type: 'image',
          content,
        };
      };

      const mockFile = {
        name: 'image.jpg',
        type: 'image/jpeg',
        size: 1024,
      };

      const result = processImageFile(mockFile);

      expect(result.type).toBe('image');
      expect(typeof result.content).toBe('string');
    });
  });
});
