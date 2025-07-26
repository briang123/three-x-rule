# File Attachment Feature

This application now supports file attachments in chat conversations, allowing users to upload files and have the AI analyze their content.

## Supported File Types

- **Text files**: `.txt` files
- **Markdown files**: `.md` files
- **Documents**: `.pdf`, `.doc`, `.docx` files
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif` files

## File Size Limits

- Maximum file size: 10MB per file
- Multiple files can be attached to a single message

## How It Works

### Frontend

1. Users can click the "Add File" button in the chat input
2. Files are validated for type and size before upload
3. Attached files are displayed with file type icons and metadata
4. Files can be removed individually before sending

### Backend

1. Files are sent via FormData to `/api/chat/with-attachments`
2. Text files are read as UTF-8 text
3. Images are converted to base64 for AI processing
4. File content is included in the system prompt for context
5. The AI receives the file content as part of the conversation context

## API Endpoints

### `/api/chat/with-attachments`

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `jsonData`: JSON string containing the chat request
  - `file-0`, `file-1`, etc.: File attachments

### Request Format

```javascript
const formData = new FormData();
formData.append(
  'jsonData',
  JSON.stringify({
    messages: [
      {
        role: 'user',
        content: 'Analyze the attached files',
      },
    ],
    model: 'gemini-2.0-flash',
    stream: true,
  }),
);

// Add files
attachments.forEach((file, index) => {
  formData.append(`file-${index}`, file);
});
```

## Testing

A test page is available at `/test-attachments` to verify the file attachment functionality.

## Error Handling

- File size validation (10MB limit)
- File type validation
- Graceful error messages for unsupported files
- Fallback to regular chat endpoint when no files are attached

## Security Considerations

- Files are processed in memory and not stored permanently
- File content is included in the AI context but not logged
- File size limits prevent abuse
- Only supported file types are accepted
