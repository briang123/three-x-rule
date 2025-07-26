'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showFileSupport, setShowFileSupport] = useState(false);
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
      <form onSubmit={handleSubmit} className="flex justify-center">
        <div className="w-1/2 relative">
          {/* Main input container */}
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-20"
              rows={2}
              maxLength={1000}
              disabled={isSubmitting}
            />

            {/* File attachment button (bottom left) with popover */}
            <div className="absolute bottom-3 left-3">
              <button
                type="button"
                onClick={openFileDialog}
                onMouseEnter={() => setShowFileSupport(true)}
                onMouseLeave={() => setShowFileSupport(false)}
                disabled={isSubmitting}
                className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {showFileSupport && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-20"
                  >
                    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700 w-80 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
                      <div className="font-medium text-sm mb-2">Supported Files</div>

                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                          <svg
                            className="w-3 h-3 text-blue-500"
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
                          <span>.txt, .md</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                          <svg
                            className="w-3 h-3 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span>.pdf</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                          <svg
                            className="w-3 h-3 text-green-500"
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
                          <span>.doc, .docx</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                          <svg
                            className="w-3 h-3 text-purple-500"
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
                          <span>.jpg, .png</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Max 10MB per file
                      </div>

                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white dark:border-t-gray-900"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right side buttons container (bottom right) */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              {/* Remix button */}
              {onRemix && <RemixDropdown onRemix={onRemix} disabled={remixDisabled} />}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={!prompt.trim() || isSubmitting}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 rounded-full flex items-center justify-center text-white transition-colors duration-200 disabled:cursor-not-allowed"
                whileHover={{ scale: prompt.trim() && !isSubmitting ? 1.05 : 1 }}
                whileTap={{ scale: prompt.trim() && !isSubmitting ? 0.95 : 1 }}
              >
                {isSubmitting ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />

          {/* Character count and help text */}
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {prompt.length}/1000 characters
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Press Enter to submit, Shift+Enter for new line
            </div>
          </div>
        </div>
      </form>

      {/* File Attachments - moved below the input */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2">
          {attachments.length > 0 && (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-400">
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

        {/* Attachment List */}
        {attachments.length > 0 && (
          <div className="space-y-1">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 transition-colors duration-200"
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
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
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
    </motion.div>
  );
}
