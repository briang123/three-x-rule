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
  isRemixGenerating?: boolean;
}

export default function ChatInput({
  onSubmit,
  currentMessage = '',
  onNewChat,
  onRemix,
  remixDisabled,
  isRemixGenerating = false,
}: ChatInputProps) {
  const [prompt, setPrompt] = useState(currentMessage);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileSupport, setShowFileSupport] = useState(false);
  const [hoveredFile, setHoveredFile] = useState<number | null>(null);
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
        'text/x-markdown',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];

      // Check file extension for additional support
      const fileName = file.name.toLowerCase();
      const isMarkdownByExtension = fileName.endsWith('.md') || fileName.endsWith('.markdown');
      const isExcelByExtension = fileName.endsWith('.xls') || fileName.endsWith('.xlsx');
      const isWordByExtension = fileName.endsWith('.doc') || fileName.endsWith('.docx');
      const isTextByExtension = fileName.endsWith('.txt');

      // Allow files based on MIME type OR extension
      const isAllowedByType = allowedTypes.includes(file.type);
      const isAllowedByExtension =
        isMarkdownByExtension || isExcelByExtension || isWordByExtension || isTextByExtension;

      if (!isAllowedByType && !isAllowedByExtension) {
        console.log('File type not supported:', file.name, 'Type:', file.type);
        errors.push(`${file.name} has an unsupported file type (${file.type}).`);
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

  const viewFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      // For images, open in a new tab
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    } else {
      // For other files, download them
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (
      file.type.includes('word') ||
      file.name.toLowerCase().endsWith('.doc') ||
      file.name.toLowerCase().endsWith('.docx')
    ) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    } else if (
      file.type.includes('excel') ||
      file.name.toLowerCase().endsWith('.xls') ||
      file.name.toLowerCase().endsWith('.xlsx')
    ) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    }
  };

  const getFileColor = (file: File) => {
    if (file.type.startsWith('image/')) {
      return 'text-purple-500';
    } else if (file.type === 'application/pdf') {
      return 'text-red-500';
    } else if (
      file.type.includes('word') ||
      file.name.toLowerCase().endsWith('.doc') ||
      file.name.toLowerCase().endsWith('.docx')
    ) {
      return 'text-green-500';
    } else if (
      file.type.includes('excel') ||
      file.name.toLowerCase().endsWith('.xls') ||
      file.name.toLowerCase().endsWith('.xlsx')
    ) {
      return 'text-orange-500';
    } else {
      return 'text-blue-500';
    }
  };

  return (
    <motion.div
      className="p-4 transition-colors duration-200"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="flex justify-center">
        <div className="w-full relative">
          <div className="relative bg-white dark:bg-kitchen-dark-surface rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
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
            <div className="absolute bottom-3 left-3 flex items-center space-x-2">
              <div className="relative">
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
                      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700 w-[32rem] backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
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
                              className="w-3 h-3 text-orange-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span>.xls, .xlsx</span>
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

              {/* File attachment icons */}
              {attachments.map((file, index) => (
                <div key={index} className="relative">
                  <button
                    type="button"
                    onClick={() => viewFile(file)}
                    onMouseEnter={() => setHoveredFile(index)}
                    onMouseLeave={() => setHoveredFile(null)}
                    className={`w-8 h-8 rounded-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center ${getFileColor(file)} hover:scale-110 transition-all duration-200 shadow-sm`}
                  >
                    {getFileIcon(file)}
                  </button>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200"
                  >
                    ×
                  </button>

                  {/* File info popover */}
                  <AnimatePresence>
                    {hoveredFile === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-20"
                      >
                        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700 w-[28rem] backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
                          <div className="flex items-start space-x-2 mb-2">
                            <div
                              className={`w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${getFileColor(file)} flex-shrink-0`}
                            >
                              {getFileIcon(file)}
                            </div>
                            <div className="font-medium text-sm break-words min-w-0">
                              {file.name}
                            </div>
                          </div>

                          <div className="space-y-1 text-gray-600 dark:text-gray-300">
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="capitalize truncate ml-2">
                                {file.type.split('/')[1]}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Size:</span>
                              <span>{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Click to {file.type.startsWith('image/') ? 'view' : 'download'}
                          </div>

                          {/* Arrow pointing down */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white dark:border-t-gray-900"></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right side buttons container (bottom right) */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              {/* Remix button */}
              {onRemix && (
                <RemixDropdown
                  onRemix={onRemix}
                  disabled={remixDisabled}
                  isGenerating={isRemixGenerating}
                />
              )}

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
            accept=".txt,.md,.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
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
    </motion.div>
  );
}
