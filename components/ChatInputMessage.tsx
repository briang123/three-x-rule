'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ConfirmationModal from './ConfirmationModal';
import StackedFileAttachments from './StackedFileAttachments';
import ModelSelectionBadge from './ModelSelectionBadge';
import { ModelInfo } from '@/lib/api-client';
import { ModelSelection } from './ModelGridSelector';

interface ChatInputMessageProps {
  onSubmit: (prompt: string, modelId?: string, attachments?: File[]) => void;
  currentMessage?: string;
  isSubmitting?: boolean;
  selectedModelId?: string;
  onModelSelect?: (modelId: string) => void;
  onModelSelectionsUpdate?: (modelId: string) => void;
  onDirectSubmit?: (prompt: string, modelId: string) => void;
  modelSelections?: Array<{ modelId: string; count: number }>;
  showModelBadges?: boolean;
  onRestoreModelSelection?: () => void;
  availableModels?: ModelInfo[];
  toolsRowRef?: React.RefObject<HTMLDivElement>;
  onModelConfirmedOrchestration?: () => void;
  showAISelection?: boolean;
  onToggleAISelection?: () => void;
  // Remix props
  onRemix?: (modelId: string) => void;
  remixDisabled?: boolean;
  isRemixGenerating?: boolean;
  // New props for model selection badge
  onModelSelectionClick?: () => void;
  modelSelectionDisabled?: boolean;
  // Default model usage flag
  isUsingDefaultModel?: boolean;
}

const ChatInputMessage = ({
  onSubmit,
  currentMessage = '',
  isSubmitting = false,
  selectedModelId,
  onModelSelect,
  onModelSelectionsUpdate,
  onDirectSubmit,
  modelSelections = [],
  showModelBadges = false,
  onRestoreModelSelection,
  availableModels = [],
  toolsRowRef: externalToolsRowRef,
  onModelConfirmedOrchestration,
  showAISelection = true,
  onToggleAISelection,
  onRemix,
  remixDisabled,
  isRemixGenerating,
  onModelSelectionClick,
  modelSelectionDisabled,
  isUsingDefaultModel = false,
}: ChatInputMessageProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(currentMessage);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [showModelConfirmation, setShowModelConfirmation] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    prompt: string;
    modelId: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const localToolsRowRef = useRef<HTMLDivElement>(null);
  const toolsRowRef = externalToolsRowRef || localToolsRowRef;

  // File attachment state
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showFileSupport, setShowFileSupport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Remix dropdown state
  const [isRemixDropdownOpen, setIsRemixDropdownOpen] = useState(false);
  const [remixModels, setRemixModels] = useState<ModelInfo[]>([]);
  const [remixLoading, setRemixLoading] = useState(true);
  const [remixError, setRemixError] = useState<string | null>(null);
  const remixButtonRef = useRef<HTMLButtonElement>(null);

  // Calculate the container height based on content and focus state
  const calculateContainerHeight = () => {
    const lineHeight = 24; // 1.5rem = 24px
    const bottomPadding = 8; // pb-8 = 2rem = 32px, but we account for line spacing

    // Calculate number of lines
    const lines = text ? text.split('\n').length : 0;
    const estimatedLines = Math.max(lines, text ? Math.ceil(text.length / 80) : 0);

    if (!text) {
      // Default: 1 row when empty
      return lineHeight + bottomPadding;
    } else {
      // With content: grow up to 8 rows
      const contentLines = Math.max(estimatedLines, 1); // Minimum 1 row
      const maxLines = Math.min(contentLines, 8);
      return lineHeight * maxLines + bottomPadding;
    }
  };

  // Calculate textarea height (should fill the container minus bottom padding)
  const calculateTextareaHeight = () => {
    const containerHeight = calculateContainerHeight();
    return containerHeight - 8; // Account for bottom padding
  };

  const containerHeight = calculateContainerHeight();
  const textareaHeight = calculateTextareaHeight();

  const handleFocus = () => {
    setIsFocused(true);
    setShouldAnimate(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!text) {
      setShouldAnimate(true);
    }
  };

  // Update text when currentMessage changes (for new chat)
  useEffect(() => {
    setText(currentMessage);
  }, [currentMessage]);

  // Fetch models for remix dropdown
  useEffect(() => {
    const fetchRemixModels = async () => {
      try {
        setRemixLoading(true);
        const response = await fetch('/api/chat');
        const data = await response.json();

        if (data.success) {
          setRemixModels(data.data.models);
        } else {
          setRemixError(data.error || 'Failed to fetch models');
        }
      } catch (err) {
        setRemixError('Failed to fetch models');
        console.error('Error fetching remix models:', err);
      } finally {
        setRemixLoading(false);
      }
    };

    fetchRemixModels();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.remix-dropdown')) {
        setIsRemixDropdownOpen(false);
      }
    };

    if (isRemixDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRemixDropdownOpen]);

  const handleRemixClick = () => {
    if (!remixDisabled && !isRemixGenerating) {
      setIsRemixDropdownOpen(!isRemixDropdownOpen);
    }
  };

  const handleRemixModelSelect = (modelId: string) => {
    if (onRemix) {
      onRemix(modelId);
    }
    setIsRemixDropdownOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Always keep animations enabled
    setShouldAnimate(true);
  };

  // File handling functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file: File) => {
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
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
      return 'text-purple-500 bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-700';
    } else if (file.type === 'application/pdf') {
      return 'text-red-500 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-700';
    } else if (
      file.type.includes('word') ||
      file.name.toLowerCase().endsWith('.doc') ||
      file.name.toLowerCase().endsWith('.docx')
    ) {
      return 'text-green-500 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-700';
    } else if (
      file.type.includes('excel') ||
      file.name.toLowerCase().endsWith('.xls') ||
      file.name.toLowerCase().endsWith('.xlsx')
    ) {
      return 'text-orange-500 bg-orange-100 dark:bg-orange-900 border-orange-200 dark:border-orange-700';
    } else {
      return 'text-blue-500 bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-700';
    }
  };

  // Auto-resize textarea when not animating
  useEffect(() => {
    if (!shouldAnimate && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 24 * 8; // 8 rows max
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [text, shouldAnimate]);

  const animationProps = shouldAnimate
    ? {
        animate: { height: containerHeight },
        transition: {
          duration: 0.2,
          ease: 'easeInOut',
        },
      }
    : {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    // Check if any models are selected in the model selections
    const hasModelSelected = modelSelections.length > 0;

    // If no model is selected, show confirmation modal for default model
    if (!hasModelSelected) {
      const defaultModelId = 'gemini-2.5-flash-lite';
      const defaultModelName = 'Gemini 2.5 Flash Lite';

      setPendingSubmission({ prompt: text.trim(), modelId: defaultModelId });
      setShowModelConfirmation(true);
      return;
    }

    // If model is selected, submit directly using the regular onSubmit with attachments
    onSubmit(text.trim(), undefined, attachments);
  };

  const handleModelConfirmation = () => {
    if (pendingSubmission) {
      // For default model, we need to update model selections so the API call works
      // but we'll use the isUsingDefaultModel flag to hide the badge
      if (onModelSelectionsUpdate) {
        onModelSelectionsUpdate(pendingSubmission.modelId);
      }

      // Then select the model in the parent component
      if (onModelSelect) {
        onModelSelect(pendingSubmission.modelId);
      }

      // Trigger orchestration after model confirmation
      if (onModelConfirmedOrchestration) {
        onModelConfirmedOrchestration();
      }

      // Use direct submit to bypass the model selection check with attachments
      if (onDirectSubmit) {
        onDirectSubmit(pendingSubmission.prompt, pendingSubmission.modelId);
      } else {
        // Fallback to regular submit with attachments
        onSubmit(pendingSubmission.prompt, pendingSubmission.modelId, attachments);
      }

      setPendingSubmission(null);
    }
    setShowModelConfirmation(false);
  };

  const handleModelConfirmationCancel = () => {
    setPendingSubmission(null);
    setShowModelConfirmation(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4 transition-all duration-300 ease-out transform-gpu will-change-transform"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
    >
      <form onSubmit={handleSubmit}>
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          style={{ padding: '2rem 2rem 3.5rem' }}
        >
          <motion.div
            className="relative"
            style={shouldAnimate ? {} : { height: `${containerHeight}px` }}
            {...animationProps}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              maxLength={1000}
              className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-15"
              style={{
                height: shouldAnimate ? `${textareaHeight}px` : 'auto',
                lineHeight: '1.5rem',
                overflowY: containerHeight >= 24 * 8 + 8 ? 'auto' : 'hidden',
                maxHeight: '12rem',
              }}
            />
          </motion.div>

          {/* Bottom Left Controls */}
          <div ref={toolsRowRef} className="absolute bottom-3 left-3 flex items-center space-x-2">
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
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
              </button>

              {/* File support tooltip */}
              {showFileSupport && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-20 transform-gpu"
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
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
            </div>

            {/* File attachment icons */}
            <StackedFileAttachments
              attachments={attachments}
              onRemove={removeAttachment}
              onView={viewFile}
              getFileIcon={getFileIcon}
              getFileColor={getFileColor}
              disabled={isSubmitting}
            />

            {/* Model Selection Badge */}
            {onModelSelectionClick && !isUsingDefaultModel && (
              <ModelSelectionBadge
                modelSelections={modelSelections}
                onClick={onModelSelectionClick}
                disabled={modelSelectionDisabled}
                isUsingDefaultModel={isUsingDefaultModel}
              />
            )}

            {/* Animated Model Badges removed - now using simplified ModelSelectionBadge approach */}

            {/* Select Models Button - show ONLY when AI selection is closed AND no models selected AND not showing badges */}
            {!showAISelection &&
              modelSelections.length === 0 &&
              !showModelBadges &&
              onToggleAISelection && (
                <motion.button
                  type="button"
                  onClick={onToggleAISelection}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors duration-200 bg-blue-500 hover:bg-blue-600 text-white"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1,
                    ease: 'easeOut',
                  }}
                  title="Select AI Models"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-medium">Select Models</span>
                </motion.button>
              )}
          </div>

          {/* Bottom Right Controls */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <div className="relative remix-dropdown">
              <button
                ref={remixButtonRef}
                disabled={remixDisabled || isRemixGenerating}
                onClick={handleRemixClick}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
                  remixDisabled || isRemixGenerating
                    ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:scale-105'
                } ${isRemixGenerating ? 'animate-pulse' : ''}`}
                type="button"
              >
                <div className="flex items-center space-x-1">
                  <svg
                    className={`w-3 h-3 ${isRemixGenerating ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  <span>{isRemixGenerating ? 'Generating...' : 'Remix'}</span>
                  {!isRemixGenerating && (
                    <svg
                      className={`w-3 h-3 transition-transform ${isRemixDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  )}
                </div>
              </button>

              {isRemixDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-[calc(100vh-64px)] overflow-y-auto bottom-full mb-1"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-2">
                      Select model for remix
                    </div>
                    <div className="space-y-1">
                      {remixModels.map((model) => (
                        <button
                          type="button"
                          key={model.id}
                          onClick={() => handleRemixModelSelect(model.id)}
                          className="w-full text-left px-3 py-2 rounded text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 break-words">
                            {model.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 rounded-full flex items-center justify-center text-white transition-colors duration-200 disabled:cursor-not-allowed"
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
                  <path d="M12 19V5M5 12l7-7 7 7"></path>
                </svg>
              )}
            </button>
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
            {text.length}/1000 characters
          </span>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Press Enter to submit, Shift+Enter for new line
          </div>
        </div>
      </form>

      {/* Model Selection Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModelConfirmation}
        onConfirm={handleModelConfirmation}
        onCancel={handleModelConfirmationCancel}
        title="Use Default Model?"
        message="No model selected. Would you like to use Gemini 2.5 Flash Lite as the default model for this message?"
        confirmText="Yes, use Gemini 2.5 Flash Lite"
        cancelText="Cancel"
        confirmButtonStyle="primary"
        position="above-input"
      />
    </motion.div>
  );
};

export default ChatInputMessage;
