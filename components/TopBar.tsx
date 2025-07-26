'use client';

import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

interface TopBarProps {
  onNewChat?: () => void;
  onSocialPosts?: () => void;
}

export default function TopBar({ onNewChat, onSocialPosts }: TopBarProps) {
  return (
    <motion.header
      className="bg-kitchen-white dark:bg-kitchen-dark-surface border-b border-kitchen-light-gray dark:border-kitchen-dark-border sticky top-0 z-50 transition-colors duration-200"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {onNewChat && (
              <button onClick={onNewChat} className="kitchen-button text-sm px-4 py-2">
                New Chat
              </button>
            )}
            {onSocialPosts && (
              <button onClick={onSocialPosts} className="kitchen-button text-sm px-4 py-2">
                Social Posts
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
