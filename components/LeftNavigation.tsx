'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navigationItems = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
    active: true,
  },
  {
    id: 'history',
    label: 'History',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 8v4l3 3" />
        <path d="M3.05 11a9 9 0 1 1 .5 3.5" />
        <path d="M2 2v5h5" />
      </svg>
    ),
    active: false,
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
    active: false,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    active: false,
  },
];

export default function LeftNavigation() {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.nav
      className={`bg-kitchen-white dark:bg-kitchen-dark-surface border-r border-kitchen-light-gray dark:border-kitchen-dark-border flex flex-col h-screen overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo/Brand */}
      <div
        className={`border-b border-kitchen-light-gray dark:border-kitchen-dark-border flex-shrink-0 ${isCollapsed ? 'p-4' : 'p-6'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-kitchen-accent-blue to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">3x</span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.h2
                  className="text-lg font-semibold text-kitchen-text dark:text-kitchen-dark-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  3x Rule
                </motion.h2>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Button */}
          <motion.button
            onClick={toggleCollapse}
            className="p-1 rounded-lg hover:bg-kitchen-light-gray dark:hover:bg-kitchen-dark-surface-light transition-colors duration-200 text-kitchen-text dark:text-kitchen-dark-text"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <motion.li key={item.id}>
              <motion.button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  item.active
                    ? 'bg-kitchen-accent-blue dark:bg-kitchen-dark-accent-blue text-white shadow-sm'
                    : 'text-kitchen-text-light dark:text-kitchen-dark-text-light hover:bg-kitchen-light-gray dark:hover:bg-kitchen-dark-surface-light hover:text-kitchen-text dark:hover:text-kitchen-dark-text'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      className="font-medium"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Bottom Section */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="p-4 border-t border-kitchen-light-gray dark:border-kitchen-dark-border flex-shrink-0"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-kitchen-light-gray dark:bg-kitchen-dark-surface-light rounded-xl p-4">
              <h3 className="text-sm font-semibold text-kitchen-text dark:text-kitchen-dark-text mb-2">Quick Tips</h3>
              <p className="text-xs text-kitchen-text-light dark:text-kitchen-dark-text-light leading-relaxed">
                Select sentences from different outputs to create a refined response using the 3x
                Rule methodology.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
