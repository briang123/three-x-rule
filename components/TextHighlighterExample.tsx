'use client';

import React, { useState } from 'react';
import TextHighlighter, { useTextHighlighter, Highlight } from './TextHighlighter';
import './TextHighlighter.css';

// Example 1: Basic usage with hook
export const BasicTextHighlighterExample: React.FC = () => {
  const { highlights, addHighlight, removeHighlight, clearHighlights, getHighlightedText } =
    useTextHighlighter();

  const handleHighlightAdd = (highlight: Highlight) => {
    addHighlight(highlight);
  };

  const handleHighlightRemove = (highlightId: string) => {
    removeHighlight(highlightId);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Basic Text Highlighter</h2>
      <p className="text-gray-600 mb-4">
        Click and drag to select text. The selected text will be highlighted with a yellow
        background. Hover over highlights to see the remove button (×).
      </p>

      <TextHighlighter
        content="This is a sample text that you can highlight. Try selecting different parts of this text to see the highlighting feature in action. The highlights will persist until you remove them using the X button that appears when you hover over them."
        highlights={highlights}
        onHighlightAdd={handleHighlightAdd}
        onHighlightRemove={handleHighlightRemove}
        className="p-4 border rounded-lg bg-white"
      />

      <div className="mt-4 space-y-2">
        <button
          onClick={clearHighlights}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All Highlights
        </button>
        <div className="text-sm text-gray-600">
          Highlighted text: {getHighlightedText() || 'None'}
        </div>
      </div>
    </div>
  );
};

// Example 2: Custom colors
export const CustomColorHighlighterExample: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedColor, setSelectedColor] = useState('rgba(255, 255, 0, 0.4)');

  const colors = [
    { name: 'Yellow', value: 'rgba(255, 255, 0, 0.4)' },
    { name: 'Green', value: 'rgba(34, 197, 94, 0.4)' },
    { name: 'Blue', value: 'rgba(59, 130, 246, 0.4)' },
    { name: 'Pink', value: 'rgba(236, 72, 153, 0.4)' },
    { name: 'Purple', value: 'rgba(168, 85, 247, 0.4)' },
  ];

  const handleHighlightAdd = (highlight: Highlight) => {
    const newHighlight = { ...highlight, color: selectedColor };
    setHighlights((prev) => [...prev, newHighlight]);
  };

  const handleHighlightRemove = (highlightId: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Custom Color Highlighter</h2>
      <p className="text-gray-600 mb-4">
        Choose a color and then highlight text. Each highlight will use the selected color.
      </p>

      <div className="mb-4 flex gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => setSelectedColor(color.value)}
            className={`px-3 py-1 rounded border ${
              selectedColor === color.value ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{ backgroundColor: color.value }}
          >
            {color.name}
          </button>
        ))}
      </div>

      <TextHighlighter
        content="This example demonstrates how to use custom colors for highlights. Select a color from the buttons above, then highlight different parts of this text. Each highlight will use the currently selected color."
        highlights={highlights}
        onHighlightAdd={handleHighlightAdd}
        onHighlightRemove={handleHighlightRemove}
        className="p-4 border rounded-lg bg-white"
      />
    </div>
  );
};

// Example 3: Enhanced Line-Based Selection (NEW)
export const EnhancedLineSelectionExample: React.FC = () => {
  const { highlights, addHighlight, removeHighlight, clearHighlights } = useTextHighlighter();

  const codeContent = `// JavaScript Arrow Functions Example
const names = ['Wes', 'Kait', 'Lux'];

// Traditional function approach
const fullNames = names.map(function(name) {
  return \`\${name} Bos\`;
});

// Arrow function approach
const fullNames2 = names.map((name) => {
  return \`\${name} Bos\`;
});

// Implicit return with arrow function
const fullNames3 = names.map(name => \`\${name} Bos\`);

// No arguments with arrow function
const fullNames4 = names.map(() => 'Cool Bos');

console.log(fullNames); // ['Wes Bos', 'Kait Bos', 'Lux Bos']
console.log(fullNames2); // ['Wes Bos', 'Kait Bos', 'Lux Bos']
console.log(fullNames3); // ['Wes Bos', 'Kait Bos', 'Lux Bos']
console.log(fullNames4); // ['Cool Bos', 'Cool Bos', 'Cool Bos']`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Enhanced Line-Based Selection</h2>
      <p className="text-gray-600 mb-4">
        This example demonstrates the enhanced line-based selection feature similar to the Wes Bos
        website. Select any part of a line to highlight the entire line. Colors automatically cycle
        between light blue, light green, and light purple. Each highlight persists with its color
        and can be removed individually.
      </p>

      <div className="mb-4 flex gap-2">
        <button
          onClick={clearHighlights}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All Highlights
        </button>
        <div className="text-sm text-gray-600 flex items-center">
          Highlights: {highlights.length}
        </div>
      </div>

      <TextHighlighter
        content={codeContent}
        highlights={highlights}
        onHighlightAdd={addHighlight}
        onHighlightRemove={removeHighlight}
        className="p-6 border rounded-lg bg-gray-50 font-mono text-sm leading-relaxed"
      />

      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Features Demonstrated:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            • <strong>Line-based selection:</strong> Select any part of a line to highlight the
            entire line
          </li>
          <li>
            • <strong>Color cycling:</strong> Colors automatically cycle between light blue, light
            green, and light purple
          </li>
          <li>
            • <strong>Real-time preview:</strong> See the highlight color as you select
          </li>
          <li>
            • <strong>Color persistence:</strong> Each highlight maintains its assigned color
          </li>
          <li>
            • <strong>Individual removal:</strong> Hover over highlights to see the remove button
          </li>
        </ul>
      </div>
    </div>
  );
};

// Example 4: With React Markdown content
export const MarkdownHighlighterExample: React.FC = () => {
  const { highlights, addHighlight, removeHighlight } = useTextHighlighter();

  const markdownContent = `
# Sample Markdown Content

This is a **bold text** example with some *italic text* as well.

## Features
- Highlight any text
- Works with markdown
- Persistent highlights
- Easy to remove

> This is a blockquote that can also be highlighted.

\`\`\`javascript
// Even code blocks can be highlighted
const example = "Hello World";
console.log(example);
\`\`\`
  `;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Markdown Content Highlighter</h2>
      <p className="text-gray-600 mb-4">
        This example shows how the highlighter works with markdown content. You can highlight any
        part of the text, including headers, lists, and code blocks.
      </p>

      <TextHighlighter
        content={markdownContent}
        highlights={highlights}
        onHighlightAdd={addHighlight}
        onHighlightRemove={removeHighlight}
        className="p-4 border rounded-lg bg-white prose max-w-none"
      />
    </div>
  );
};

// Example 5: Disabled state
export const DisabledHighlighterExample: React.FC = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  const { highlights, addHighlight, removeHighlight } = useTextHighlighter();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Disabled State Example</h2>
      <p className="text-gray-600 mb-4">
        Toggle the disabled state to see how the highlighter behaves when disabled.
      </p>

      <button
        onClick={() => setIsDisabled(!isDisabled)}
        className={`px-4 py-2 rounded mb-4 ${
          isDisabled
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        {isDisabled ? 'Enable' : 'Disable'} Highlighter
      </button>

      <TextHighlighter
        content="This text can be highlighted when the highlighter is enabled. When disabled, you won't be able to create new highlights, but existing highlights will still be visible and removable."
        highlights={highlights}
        onHighlightAdd={addHighlight}
        onHighlightRemove={removeHighlight}
        disabled={isDisabled}
        className="p-4 border rounded-lg bg-white"
      />
    </div>
  );
};

// Main example component that combines all examples
export const TextHighlighterExamples: React.FC = () => {
  return (
    <div className="space-y-12">
      <EnhancedLineSelectionExample />
      <BasicTextHighlighterExample />
      <CustomColorHighlighterExample />
      <MarkdownHighlighterExample />
      <DisabledHighlighterExample />
    </div>
  );
};

export default TextHighlighterExamples;
