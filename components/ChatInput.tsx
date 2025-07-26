'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSubmit: (prompt: string, attachments?: File[]) => void;
  currentMessage?: string;
  onNewChat?: () => void;
}

export default function ChatInput({ onSubmit, currentMessage = '', onNewChat }: ChatInputProps) {
  const [prompt, setPrompt] = useState(currentMessage);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update prompt when currentMessage changes (for new chat)
  useEffect(() => {
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
      setPrompt('');
      setAttachments([]);
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
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      className="bg-kitchen-white border border-kitchen-light-gray rounded-xl p-4"
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
              placeholder="Enter your prompt here... (e.g., 'Explain the benefits of the 3x Rule methodology')"
              className="kitchen-input w-full resize-none"
              rows={2}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-kitchen-text-light">
                {prompt.length}/1000 characters
              </span>
              <div className="text-xs text-kitchen-text-light">
                Press Enter to submit, Shift+Enter for new line
              </div>
            </div>
          </div>

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

        {/* File Attachments */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={isSubmitting}
              className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
              accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
            {attachments.length > 0 && (
              <span className="text-xs text-gray-500">{attachments.length} file(s) attached</span>
            )}
          </div>

          {/* Attachment List */}
          {attachments.length > 0 && (
            <div className="space-y-1">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
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
