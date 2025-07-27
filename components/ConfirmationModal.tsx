'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'primary' | 'secondary' | 'danger';
  position?: 'center' | 'above-input';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  confirmButtonStyle = 'primary',
  position = 'center',
}) => {
  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus the confirm button when modal opens
      const confirmButton = document.querySelector('[data-confirm-button]') as HTMLButtonElement;
      if (confirmButton) {
        setTimeout(() => confirmButton.focus(), 100);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  const getConfirmButtonClasses = () => {
    switch (confirmButtonStyle) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-500';
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500';
      default:
        return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className={`fixed z-50 ${
              position === 'above-input'
                ? 'bottom-32 right-4 left-4 md:left-auto md:right-4 md:w-80'
                : 'inset-0 flex items-center justify-center p-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
                position === 'above-input' ? 'w-full' : 'max-w-md w-full mx-4'
              }`}
            >
              {/* Header */}
              <div
                className={`border-b border-gray-200 dark:border-gray-700 ${
                  position === 'above-input' ? 'px-4 py-3' : 'px-6 py-4'
                }`}
              >
                <h3
                  className={`font-semibold text-gray-900 dark:text-white ${
                    position === 'above-input' ? 'text-base' : 'text-lg'
                  }`}
                >
                  {title}
                </h3>
              </div>

              {/* Content */}
              <div className={`${position === 'above-input' ? 'px-4 py-3' : 'px-6 py-4'}`}>
                <p
                  className={`text-gray-600 dark:text-gray-300 leading-relaxed ${
                    position === 'above-input' ? 'text-sm' : ''
                  }`}
                >
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div
                className={`bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end space-x-3 ${
                  position === 'above-input' ? 'px-4 py-3' : 'px-6 py-4'
                }`}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className={`font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                    position === 'above-input' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                  }`}
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  data-confirm-button
                  className={`font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getConfirmButtonClasses()} ${
                    position === 'above-input' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                  }`}
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
