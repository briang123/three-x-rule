import React from 'react';
import { useTypewriter } from '@/hooks/useTypewriter';
import ReactMarkdown from 'react-markdown';

export function Typewriter({
  text,
  className = '',
  speed = 30,
  pauseAfterPunctuation = 300,
  isNewContent = true,
}: {
  text: string;
  className?: string;
  speed?: number;
  pauseAfterPunctuation?: number;
  isNewContent?: boolean;
}) {
  const { displayed, done } = useTypewriter({
    text,
    speed,
    pauseAfterPunctuation,
    isNewContent,
  });

  return (
    <div className={`text-base transition-opacity duration-300 ${className}`}>
      <div className="relative">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            code: ({ children }) => (
              <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-200 p-2 rounded text-xs overflow-x-auto">{children}</pre>
            ),
            ul: ({ children }) => <ul className="mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic">{children}</blockquote>
            ),
          }}
        >
          {displayed}
        </ReactMarkdown>
        {!done && (
          <span className="ml-1 inline-block w-2 animate-pulse transition-opacity duration-200">
            |
          </span>
        )}
      </div>
    </div>
  );
}
