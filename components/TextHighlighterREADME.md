# TextHighlighter Component

A modular, reusable React component that provides text highlighting functionality similar to note-taking apps like GoodNotes. This component can be easily dropped into any React application with minimal dependencies.

## Features

- ✅ **Click and drag text selection** - Natural text selection behavior
- ✅ **Persistent highlights** - Highlights remain until manually removed
- ✅ **X button for removal** - Hover over highlights to see remove button
- ✅ **Custom colors** - Support for any highlight color
- ✅ **Accessibility** - Keyboard navigation and screen reader support
- ✅ **Responsive** - Works on desktop and mobile devices
- ✅ **TypeScript support** - Full TypeScript definitions included
- ✅ **Customizable** - Extensive props for customization
- ✅ **Hook-based** - Optional `useTextHighlighter` hook for state management

## Installation

1. Copy the following files to your project:

   - `TextHighlighter.tsx`
   - `TextHighlighter.css`

2. Import the CSS in your main CSS file or component:
   ```css
   @import './components/TextHighlighter.css';
   ```

## Basic Usage

### Simple Implementation

```tsx
import React from 'react';
import TextHighlighter from './components/TextHighlighter';

function MyComponent() {
  const [highlights, setHighlights] = useState([]);

  const handleHighlightAdd = (highlight) => {
    setHighlights((prev) => [...prev, highlight]);
  };

  const handleHighlightRemove = (highlightId) => {
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
  };

  return (
    <TextHighlighter
      content="This is some text that can be highlighted by clicking and dragging."
      highlights={highlights}
      onHighlightAdd={handleHighlightAdd}
      onHighlightRemove={handleHighlightRemove}
    />
  );
}
```

### Using the Hook (Recommended)

```tsx
import React from 'react';
import TextHighlighter, { useTextHighlighter } from './components/TextHighlighter';

function MyComponent() {
  const { highlights, addHighlight, removeHighlight, clearHighlights, getHighlightedText } =
    useTextHighlighter();

  return (
    <div>
      <TextHighlighter
        content="Click and drag to highlight this text."
        highlights={highlights}
        onHighlightAdd={addHighlight}
        onHighlightRemove={removeHighlight}
      />

      <button onClick={clearHighlights}>Clear All</button>
      <p>Highlighted: {getHighlightedText()}</p>
    </div>
  );
}
```

## Props

### TextHighlighter Props

| Prop                | Type                             | Default                    | Description                              |
| ------------------- | -------------------------------- | -------------------------- | ---------------------------------------- |
| `content`           | `string \| React.ReactNode`      | -                          | The text content to be highlighted       |
| `highlights`        | `Highlight[]`                    | `[]`                       | Array of current highlights              |
| `onHighlightAdd`    | `(highlight: Highlight) => void` | -                          | Callback when a new highlight is created |
| `onHighlightRemove` | `(highlightId: string) => void`  | -                          | Callback when a highlight is removed     |
| `highlightColor`    | `string`                         | `'rgba(255, 255, 0, 0.4)'` | Default color for new highlights         |
| `className`         | `string`                         | `''`                       | Additional CSS classes                   |
| `disabled`          | `boolean`                        | `false`                    | Disable highlighting functionality       |

### Highlight Interface

```typescript
interface Highlight {
  id: string; // Unique identifier
  text: string; // The highlighted text
  startOffset: number; // Start position in the text
  endOffset: number; // End position in the text
  color: string; // Highlight color (CSS color value)
  timestamp: number; // When the highlight was created
}
```

## Hook API

### useTextHighlighter

The `useTextHighlighter` hook provides state management for highlights.

```typescript
const {
  highlights,           // Array of current highlights
  addHighlight,        // Function to add a new highlight
  removeHighlight,     // Function to remove a highlight by ID
  clearHighlights,     // Function to remove all highlights
  getHighlightedText   // Function to get all highlighted text as string
} = useTextHighlighter(initialHighlights?);
```

## Advanced Examples

### Custom Colors

```tsx
function CustomColorExample() {
  const [selectedColor, setSelectedColor] = useState('rgba(255, 255, 0, 0.4)');
  const { highlights, addHighlight, removeHighlight } = useTextHighlighter();

  const handleHighlightAdd = (highlight) => {
    addHighlight({ ...highlight, color: selectedColor });
  };

  return (
    <div>
      <div>
        <button onClick={() => setSelectedColor('rgba(255, 0, 0, 0.4)')}>Red</button>
        <button onClick={() => setSelectedColor('rgba(0, 255, 0, 0.4)')}>Green</button>
        <button onClick={() => setSelectedColor('rgba(0, 0, 255, 0.4)')}>Blue</button>
      </div>

      <TextHighlighter
        content="Select a color above, then highlight this text."
        highlights={highlights}
        onHighlightAdd={handleHighlightAdd}
        onHighlightRemove={removeHighlight}
        highlightColor={selectedColor}
      />
    </div>
  );
}
```

### With Markdown Content

```tsx
import ReactMarkdown from 'react-markdown';

function MarkdownExample() {
  const { highlights, addHighlight, removeHighlight } = useTextHighlighter();

  const markdownContent = `
# Sample Content

This is **bold** and *italic* text.

- List item 1
- List item 2

> This is a blockquote
  `;

  return (
    <TextHighlighter
      content={markdownContent}
      highlights={highlights}
      onHighlightAdd={addHighlight}
      onHighlightRemove={removeHighlight}
    >
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
    </TextHighlighter>
  );
}
```

### Disabled State

```tsx
function DisabledExample() {
  const [isDisabled, setIsDisabled] = useState(false);
  const { highlights, addHighlight, removeHighlight } = useTextHighlighter();

  return (
    <div>
      <button onClick={() => setIsDisabled(!isDisabled)}>
        {isDisabled ? 'Enable' : 'Disable'} Highlighter
      </button>

      <TextHighlighter
        content="This text can be highlighted when enabled."
        highlights={highlights}
        onHighlightAdd={addHighlight}
        onHighlightRemove={removeHighlight}
        disabled={isDisabled}
      />
    </div>
  );
}
```

## Styling

The component includes default styles in `TextHighlighter.css`. You can customize the appearance by overriding these CSS classes:

- `.text-highlighter-container` - Main container
- `.text-highlighter-span` - Individual highlight spans
- `.text-highlighter-remove-btn` - Remove button (×)

### Custom Styling Example

```css
/* Custom highlight colors */
.text-highlighter-span {
  background-color: rgba(59, 130, 246, 0.3) !important;
  border-radius: 4px !important;
}

/* Custom remove button */
.text-highlighter-remove-btn {
  background-color: rgba(220, 38, 38, 0.9) !important;
  width: 20px !important;
  height: 20px !important;
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Accessibility

The component includes several accessibility features:

- **Keyboard navigation** - Tab through highlights and remove buttons
- **Screen reader support** - Proper ARIA labels and descriptions
- **High contrast mode** - Respects user's high contrast preferences
- **Reduced motion** - Respects user's motion preferences

## Performance

The component is optimized for performance:

- **Memoized callbacks** - Prevents unnecessary re-renders
- **Efficient text processing** - Minimal DOM manipulation
- **Debounced selection** - Smooth highlighting experience

## Troubleshooting

### Common Issues

1. **Highlights not appearing**

   - Ensure the CSS file is imported
   - Check that `onHighlightAdd` callback is provided
   - Verify the content is a string or valid React node

2. **Remove buttons not working**

   - Check browser console for JavaScript errors
   - Ensure the global `removeTextHighlight` function is available

3. **Styling conflicts**
   - Use more specific CSS selectors
   - Check for conflicting CSS frameworks

### Debug Mode

Add this to your component for debugging:

```tsx
<TextHighlighter
  content="Debug text"
  highlights={highlights}
  onHighlightAdd={(highlight) => {
    console.log('New highlight:', highlight);
    addHighlight(highlight);
  }}
  onHighlightRemove={(id) => {
    console.log('Removing highlight:', id);
    removeHighlight(id);
  }}
/>
```

## Contributing

To extend the component:

1. **Add new features** - Extend the `TextHighlighterProps` interface
2. **Custom styling** - Override CSS classes or add new ones
3. **Additional hooks** - Create new hooks for specific use cases

## License

This component is provided as-is for use in any project. No license restrictions apply.
