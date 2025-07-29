'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StackedFileAttachmentsProps {
  attachments: File[];
  onRemove: (index: number) => void;
  onView: (file: File) => void;
  getFileIcon: (file: File) => React.ReactNode;
  getFileColor: (file: File) => string;
  disabled?: boolean;
}

const StackedFileAttachments: React.FC<StackedFileAttachmentsProps> = ({
  attachments,
  onRemove,
  onView,
  getFileIcon,
  getFileColor,
  disabled = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (attachments.length === 0) {
    return null;
  }

  // Show all files stacked, no hidden count
  const visibleAttachments = attachments;

  return (
    <div className="relative flex items-center">
      <div className="relative flex items-center">
        {visibleAttachments.map((file, index) => {
          const isHovered = hoveredIndex === index;
          // The topmost file is either the hovered one or the last one (but not both)
          const isTopFile = isHovered
            ? true
            : hoveredIndex === null && index === visibleAttachments.length - 1;

          return (
            <motion.div
              key={index}
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: isHovered ? 1.1 : 1,
                opacity: 1,
                zIndex: isHovered ? 10 : index,
              }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
              style={{
                marginLeft: index === 0 ? 0 : '-12px', // Overlap files
              }}
            >
              <motion.button
                type="button"
                onClick={() => onView(file)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                disabled={disabled}
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center 
                  transition-all duration-200 shadow-sm
                  ${getFileColor(file)}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}
                  ${isHovered ? 'shadow-lg' : ''}
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {getFileIcon(file)}
              </motion.button>

              {/* Remove button - only show on the topmost file */}
              <AnimatePresence>
                {isTopFile && (
                  <motion.button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 z-20"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    ×
                  </motion.button>
                )}
              </AnimatePresence>

              {/* File info popover */}
              <AnimatePresence>
                {isHovered && (
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
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-30"
                  >
                    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 whitespace-nowrap">
                      <div className="font-medium mb-1">{file.name}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        Click to {file.type.startsWith('image/') ? 'view' : 'download'}
                      </div>

                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-900"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StackedFileAttachments;
