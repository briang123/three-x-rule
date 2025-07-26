'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import RemixDropdown from './RemixDropdown';

interface ChatInputProps {
  onSubmit: (prompt: string, attachments?: File[]) => void;
  currentMessage?: string;
  onNewChat?: () => void;
  onRemix?: (modelId: string) => void;
  remixDisabled?: boolean;
}

export default function ChatInput({
  onSubmit,
  currentMessage = '',
  onNewChat,
  onRemix,
  remixDisabled,
}: ChatInputProps) {
  const [prompt, setPrompt] = useState(currentMessage);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update prompt when currentMessage changes (for new chat)
  useEffect(() => {
    console.log('ChatInput: currentMessage changed to:', currentMessage);
    setPrompt(currentMessage);
    if (currentMessage === '' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(prompt.trim(), attachments);
      // Do not clear the prompt after submit
      // Do not clear attachments - they persist until manually removed
    } catch (error) {
      console.error('Error submitting prompt:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      // Check file type
      const allowedTypes = [
        'text/plain',
        'text/markdown',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];

      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} has an unsupported file type.`);
        return;
      }

      validFiles.push(file);
    });

    // Show errors if any
    if (errors.length > 0) {
      alert('File upload errors:\n' + errors.join('\n'));
    }

    // Add valid files
    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
    }

    // Clear the input value so the same file can be selected again
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllAttachments = () => {
    setAttachments([]);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      className="bg-kitchen-white dark:bg-kitchen-dark-surface border-t border-kitchen-light-gray dark:border-t-kitchen-dark-border p-4 transition-colors duration-200"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-end space-x-4">
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="drop in a prompt, and watch the magic unfold!"
              className="kitchen-input w-full resize-none"
              rows={2}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light">
                {prompt.length}/1000 characters
              </span>
              <div className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light">
                Press Enter to submit, Shift+Enter for new line
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {onRemix && <RemixDropdown onRemix={onRemix} disabled={remixDisabled} />}
            <motion.button
              type="submit"
              disabled={!prompt.trim() || isSubmitting}
              className="kitchen-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              whileHover={{ scale: prompt.trim() && !isSubmitting ? 1.02 : 1 }}
              whileTap={{ scale: prompt.trim() && !isSubmitting ? 0.98 : 1 }}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m22 2-7 20-4-9-9-4 20-7z" />
                  </svg>
                  <span>Submit</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* File Attachments */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={isSubmitting}
              className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 dark:border-kitchen-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-kitchen-dark-surface-light disabled:opacity-50 transition-colors duration-200 text-kitchen-text dark:text-kitchen-dark-text"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
            {attachments.length > 0 && (
              <>
                <span className="text-xs text-gray-500 dark:text-kitchen-dark-text-light">
                  {attachments.length} file(s) attached
                </span>
                <button
                  type="button"
                  onClick={clearAllAttachments}
                  disabled={isSubmitting}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors duration-200"
                >
                  Clear All
                </button>
              </>
            )}
          </div>

          {/* File type info */}
          <div className="text-xs text-gray-500 dark:text-kitchen-dark-text-light">
            Supported: Text files (.txt), Markdown (.md), PDFs, Word docs, and images (JPG, PNG,
            GIF). Max 10MB per file. Attachments persist until manually removed.
          </div>

          {/* Attachment List */}
          {attachments.length > 0 && (
            <div className="space-y-1">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-kitchen-dark-surface-light rounded border border-gray-200 dark:border-kitchen-dark-border transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    {file.type.startsWith('image/') ? (
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-500 dark:text-kitchen-dark-text-light"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 dark:text-kitchen-dark-text truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-kitchen-dark-text-light">
                        {file.type} • {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </motion.div>
  );
}
