# File Attachments Feature Documentation

## Overview

The file attachments feature allows users to upload and attach files to their chat messages. The system supports various file types including text files, markdown, PDFs, Word documents, Excel files, and images. The interface uses a **stacked design** to conserve horizontal space while providing smooth hover animations and interactions.

## Requirements

### Functional Requirements

- Users can attach multiple files to a single message
- File size limit: 10MB per file
- Supported file types: text, markdown, PDF, Word, Excel, images
- **Stacked file display** with hover animations using Framer Motion
- Files are displayed with appropriate icons and hover tooltips
- Users can remove attachments before sending
- Users can preview/download attached files
- Files are processed and sent to the AI API for analysis

### Technical Requirements

- File validation (size and type)
- Base64 encoding for API transmission
- Proper error handling for invalid files
- Integration with existing chat flow
- Mock API support for testing and development
- **Smooth animations** using Framer Motion
- **Stacked UI** to conserve horizontal space

## Technical Implementation

### Frontend Components

#### StackedFileAttachments Component

The new stacked file attachment component provides a space-efficient interface:

```typescript
interface StackedFileAttachmentsProps {
  attachments: File[];
  onRemove: (index: number) => void;
  onView: (file: File) => void;
  getFileIcon: (file: File) => React.ReactNode;
  getFileColor: (file: File) => string;
  disabled?: boolean;
}
```

**Key Features:**

- **Stacked display**: Files overlap horizontally to save space
- **Hover animations**: Files scale and bring to front on hover
- **Smart visibility**: Shows max 4 files, with count for hidden files
- **Smooth transitions**: Framer Motion animations for all interactions
- **Accessible interactions**: Clear hover states and action feedback

**Animation Implementation:**

```typescript
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{
    scale: isHovered ? 1.1 : 1,
    opacity: 1,
    zIndex: isHovered ? 10 : index
  }}
  transition={{
    duration: 0.2,
    ease: 'easeOut',
  }}
  style={{
    marginLeft: index === 0 ? 0 : '-12px', // Overlap files
  }}
>
```

#### ChatInputMessage Component

The main component handling file attachments is `ChatInputMessage.tsx`:

```typescript
// State variables for file handling
const [attachments, setAttachments] = useState<File[]>([]);
const [showFileSupport, setShowFileSupport] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
```

#### Key Functions

**File Selection and Validation:**

```typescript
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);

  files.forEach((file: File) => {
    // Size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`);
      return;
    }

    // Type validation
    const validTypes = [
      'text/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/',
    ];

    const isValidType =
      validTypes.some((type) => file.type.startsWith(type)) ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.txt');

    if (!isValidType) {
      alert(`File type not supported: ${file.name}`);
      return;
    }

    setAttachments((prev) => [...prev, file]);
  });

  // Clear input for future selections
  if (event.target) {
    event.target.value = '';
  }
};
```

**File Removal:**

```typescript
const removeAttachment = (index: number) => {
  setAttachments((prev) => prev.filter((_, i) => i !== index));
};
```

**File Preview/Download:**

```typescript
const viewFile = (file: File) => {
  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  } else {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
```

### Backend API

#### API Endpoint

- **Route**: `/api/chat/with-attachments`
- **Method**: POST
- **Content-Type**: `multipart/form-data`

#### Mock API Support

The API includes comprehensive mock functionality for testing and development:

```typescript
// Check if we should use mock API
const USE_MOCK_API = process.env.USE_MOCK_API === 'true' || !process.env.GEMINI_API_KEY;
```

**Mock Response Generation:**

```typescript
function generateMockResponseWithFiles(
  prompt: string,
  modelId: string,
  files: Array<{ name: string; content: string; mimeType: string }>,
  images: string[],
): string {
  const fileContext =
    files.length > 0 ? `\n\nAttached files: ${files.map((f) => f.name).join(', ')}` : '';
  const imageContext = images.length > 0 ? `\n\nAttached images: ${images.length} image(s)` : '';

  const responses = [
    `I've analyzed your request: "${prompt}"${fileContext}${imageContext}. Based on the provided content, here's my analysis and recommendations.`,
    `Thank you for sharing this information. I've reviewed the attached files and can provide insights on your query: "${prompt}".`,
    // ... more response variations
  ];

  const hash = prompt.length + modelId.length + files.length + images.length;
  const mockResponseIndex = hash % responses.length;
  return `${responses[mockResponseIndex]} (Mock response from ${modelId})`;
}
```

#### Error Handling

The API includes comprehensive error handling for various scenarios:

**File Processing Errors:**

```typescript
// File size validation
if (file.size > 10 * 1024 * 1024) {
  return NextResponse.json(
    {
      success: false,
      error: `File ${file.name} is too large. Maximum size is 10MB.`,
    },
    { status: 400 },
  );
}
```

**API Error Handling:**

```typescript
// Rate limit errors
if (errorMessage.includes('429') || errorMessage.includes('quota')) {
  return NextResponse.json(
    {
      success: false,
      error: 'API rate limit exceeded. Please try again in a few moments.',
      details: 'The AI service is currently experiencing high demand.',
    },
    { status: 429 },
  );
}

// Authentication errors
if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
  return NextResponse.json(
    {
      success: false,
      error: 'Authentication failed. Please check your API configuration.',
      details: 'The API key may be invalid or expired.',
    },
    { status: 401 },
  );
}

// Model-specific errors
if (errorMessage.includes('model') || errorMessage.includes('not found')) {
  return NextResponse.json(
    {
      success: false,
      error: 'Model not available. Please try a different model.',
      details: 'The requested AI model is currently unavailable.',
    },
    { status: 400 },
  );
}
```

**Streaming Error Handling:**

```typescript
// Handle streaming errors gracefully
let errorMessage = 'Unknown streaming error';
let statusCode = 500;

if (error instanceof Error) {
  errorMessage = error.message;

  if (error.message.includes('429') || error.message.includes('quota')) {
    errorMessage = 'Rate limit exceeded during streaming';
    statusCode = 429;
  } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
    errorMessage = 'Authentication failed during streaming';
    statusCode = 401;
  }
}
```

## User Experience

### Stacked File Attachment Process

1. User clicks the "+" button next to the chat input
2. File dialog opens for file selection
3. Selected files are validated (size and type)
4. **Files appear as stacked circular badges** with overlap
5. **Hover over files** to bring them to front and see details
6. **Remove button appears** on hover or for top file
7. **Click file badge** to preview/download
8. **Hidden files count** shows when more than 4 files
9. Files are sent with the message when submitted

### Visual Feedback

- **Stacked circular badges** with file type icons
- **Color-coded icons** for different file types
- **Smooth hover animations** with scale and z-index changes
- **File info popovers** on hover with detailed information
- **Remove buttons** that appear on hover
- **Hidden files indicator** with count and tooltip
- **Loading states** during file processing

### Animation Features

- **Hover scaling**: Files scale to 1.1x on hover
- **Z-index management**: Hovered files come to front
- **Smooth transitions**: 200ms easeOut animations
- **AnimatePresence**: Smooth enter/exit animations for popovers
- **Spring animations**: Natural feel for interactive elements

## API Integration

### Request Format

```typescript
// Multipart form data with JSON and files
const formData = new FormData();
formData.append('jsonData', JSON.stringify({
  messages: [...],
    model: 'gemini-2.0-flash',
  context: { ... },
  temperature: 0.7
}));

// Add files with unique keys
attachments.forEach((file, index) => {
  formData.append(`file-${index}`, file);
});
```

### Response Format

```typescript
// Success response
{
  success: true,
  data: {
    content: "AI response content",
    model: "gemini-2.0-flash"
  },
  timestamp: "2024-01-01T00:00:00.000Z"
}

// Error response
{
  success: false,
  error: "Error message",
  details: "Additional error details",
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

## Testing

### Unit Tests

Comprehensive test suite in `StackedFileAttachments.test.tsx` covers:

- **Stacked display** with multiple files
- **Hover interactions** and animations
- **File removal** functionality
- **File preview/download** actions
- **Hidden files** count and tooltip
- **Different file types** handling
- **Disabled state** behavior
- **Animation states** and transitions

### Mock API Testing

The mock API can be enabled for testing:

```bash
# Enable mock API
USE_MOCK_API=true npm run dev

# Or disable API key to force mock mode
GEMINI_API_KEY= npm run dev
```

## Browser Compatibility

### Supported Features

- File API (File, FileReader, URL.createObjectURL)
- FormData for multipart uploads
- **Framer Motion** animations
- **CSS transforms** and transitions
- File validation and type checking

### Fallbacks

- Graceful degradation for unsupported file types
- Clear error messages for browser limitations
- Alternative download methods for file preview
- **Animation fallbacks** for older browsers

## Performance Considerations

### File Processing

- Client-side file validation before upload
- Base64 encoding for API transmission
- Proper cleanup of object URLs
- File size limits to prevent memory issues

### Animation Performance

- **GPU acceleration** with transform3d
- **Efficient re-renders** with React.memo
- **Debounced hover** states to prevent excessive animations
- **Optimized transitions** with proper easing

### API Optimization

- Streaming responses for large AI responses
- Efficient file content processing
- Error handling to prevent timeouts
- Mock API for development and testing

## Security

### File Validation

- Strict file type checking
- Size limits to prevent abuse
- Client and server-side validation
- Secure file content processing

### API Security

- Input validation and sanitization
- Error message sanitization
- Rate limiting considerations
- Authentication and authorization checks

## Future Enhancements

### Planned Features

- **Drag and drop** file upload
- **File preview** in modal/overlay
- **Progress indicators** for large files
- **Batch file processing**
- **File compression** for images
- **Cloud storage** integration
- **Advanced animations** with spring physics

### Technical Improvements

- **WebSocket support** for real-time file processing
- **File chunking** for large uploads
- **Caching** for frequently used files
- **Advanced file type** detection
- **OCR** for image content extraction
- **Enhanced animations** with gesture support

## Troubleshooting

### Common Issues

**File Upload Fails:**

- Check file size (max 10MB)
- Verify file type is supported
- Ensure browser supports File API
- Check network connectivity

**Animation Issues:**

- Verify Framer Motion is installed
- Check for CSS conflicts
- Ensure proper z-index stacking
- Test on different browsers

**API Errors:**

- Verify API key configuration
- Check rate limits and quotas
- Ensure proper request format
- Review server logs for details

**Mock API Issues:**

- Confirm `USE_MOCK_API=true` environment variable
- Check that API key is not set (forces mock mode)
- Verify mock response generation
- Test with different file types

### Debug Information

- Browser console logs for client-side errors
- Server logs for API processing issues
- Network tab for request/response details
- File validation feedback in UI
- **Animation performance** monitoring

## Configuration

### Environment Variables

```bash
# Enable mock API for testing
USE_MOCK_API=true

# API key for real AI service
GEMINI_API_KEY=your_api_key_here

# Optional: Custom file size limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### File Type Configuration

```typescript
// Supported MIME types
const SUPPORTED_TYPES = [
  'text/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/',
];

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
```

### Animation Configuration

```typescript
// Animation settings for stacked files
const ANIMATION_CONFIG = {
  duration: 0.2,
  ease: 'easeOut',
  hoverScale: 1.1,
  stackOverlap: -12, // pixels
  maxVisible: 4,
};
```
