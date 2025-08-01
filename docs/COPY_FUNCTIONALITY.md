# Copy to Clipboard Functionality

This document describes the copy to clipboard functionality implemented in the project.

## Overview

The copy to clipboard functionality has been refactored into a reusable custom hook and component to promote code reusability and maintainability.

## Components

### useCopyToClipboard Hook

**Location**: `hooks/useCopyToClipboard.ts`

A custom React hook that handles copying text to the clipboard with feedback state management.

#### Usage

```typescript
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

function MyComponent() {
  const { copied, copyToClipboard, resetCopied } = useCopyToClipboard({
    timeout: 2000, // Optional: custom timeout in ms (default: 2000)
    onSuccess: () => console.log('Copied successfully'), // Optional: success callback
    onError: (error) => console.error('Copy failed:', error), // Optional: error callback
  });

  const handleCopy = async () => {
    await copyToClipboard('Text to copy');
  };

  return (
    <button onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
```

#### API

- `copied: boolean` - Whether the text was recently copied
- `copyToClipboard(text: string): Promise<void>` - Function to copy text to clipboard
- `resetCopied(): void` - Manually reset the copied state

#### Options

- `timeout?: number` - Time in milliseconds before the copied state resets (default: 2000)
- `onSuccess?: () => void` - Callback function called when copy succeeds
- `onError?: (error: Error) => void` - Callback function called when copy fails

### CopyButton Component

**Location**: `components/CopyButton.tsx`

A reusable button component that provides copy to clipboard functionality with visual feedback.

#### Usage

```typescript
import CopyButton from '@/components/CopyButton';

function MyComponent() {
  return (
    <CopyButton
      content="Text to copy"
      size="md" // 'sm' | 'md' | 'lg'
      variant="default" // 'default' | 'minimal'
      className="custom-class"
      title="Custom tooltip"
    />
  );
}
```

#### Props

- `content: string` - The text to copy to clipboard
- `size?: 'sm' | 'md' | 'lg'` - Size of the button icon (default: 'md')
- `variant?: 'default' | 'minimal'` - Visual variant of the button (default: 'default')
- `className?: string` - Additional CSS classes
- `title?: string` - Tooltip text (default: 'Copy to clipboard')

## Implementation Details

### Features

1. **Visual Feedback**: Shows a checkmark icon when text is copied
2. **Auto-reset**: Automatically resets the copied state after a configurable timeout
3. **Error Handling**: Gracefully handles clipboard permission errors
4. **Accessibility**: Includes proper ARIA attributes and tooltips
5. **Customizable**: Supports different sizes and visual variants

### Browser Compatibility

The implementation uses the modern `navigator.clipboard.writeText()` API, which is supported in:

- Chrome 66+
- Firefox 63+
- Safari 13.1+
- Edge 79+

### Error Handling

If the clipboard API is not available or permission is denied, the error is logged to the console and the `onError` callback is called if provided.

## Testing

Both the hook and component include comprehensive test suites:

- `hooks/useCopyToClipboard.test.ts` - Tests for the custom hook
- `components/CopyButton.test.tsx` - Tests for the component

Run tests with:

```bash
npm test -- --testPathPattern="useCopyToClipboard|CopyButton"
```

## Migration from Old Implementation

The old implementation used inline copy functionality. The new implementation provides:

1. **Better separation of concerns** - Logic separated from UI
2. **Reusability** - Can be used across multiple components
3. **Consistency** - Standardized copy behavior throughout the app
4. **Maintainability** - Centralized copy logic for easier updates
5. **Testability** - Isolated functionality for better testing

## Examples

### Basic Usage

```typescript
<CopyButton content="Hello, World!" />
```

### Custom Styling

```typescript
<CopyButton
  content="Custom styled copy button"
  className="bg-blue-500 text-white rounded-lg p-2"
  size="lg"
  variant="minimal"
/>
```

### With Custom Callbacks

```typescript
const { copyToClipboard } = useCopyToClipboard({
  onSuccess: () => toast.success('Copied to clipboard!'),
  onError: () => toast.error('Failed to copy'),
});

await copyToClipboard('Important text');
```
