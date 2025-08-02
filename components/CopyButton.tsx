import React from 'react';
import { useCopyToClipboard } from '@/hooks';

interface CopyButtonProps {
  content: string;
  className?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

const CopyButton: React.FC<CopyButtonProps> = ({
  content,
  className = '',
  title = 'Copy to clipboard',
  size = 'md',
  variant = 'default',
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  const handleCopy = async () => {
    await copyToClipboard(content);
  };

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    default: 'p-1 text-kitchen-text-light hover:text-kitchen-text transition-colors',
    minimal: 'p-0.5 text-gray-400 hover:text-gray-600 transition-colors',
  };

  return (
    <button
      onClick={handleCopy}
      className={`${variantClasses[variant]} ${className}`}
      title={title}
    >
      {copied ? (
        <svg
          className={`${sizeClasses[size]} text-green-500`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
};

export default CopyButton;
