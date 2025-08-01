import { useState, useCallback } from 'react';

interface UseCopyToClipboardOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseCopyToClipboardReturn {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
  resetCopied: () => void;
}

export const useCopyToClipboard = (
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn => {
  const { timeout = 2000, onSuccess, onError } = options;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        // Reset copied state after timeout
        setTimeout(() => {
          setCopied(false);
        }, timeout);

        onSuccess?.();
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        onError?.(err as Error);
      }
    },
    [timeout, onSuccess, onError],
  );

  const resetCopied = useCallback(() => {
    setCopied(false);
  }, []);

  return {
    copied,
    copyToClipboard,
    resetCopied,
  };
};
