'use client';

import { motion } from 'framer-motion';

interface TopBarProps {
  onNewChat?: () => void;
}

export default function TopBar({ onNewChat }: TopBarProps) {
  return (
    <motion.header
      className="bg-kitchen-white border-b border-kitchen-light-gray sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {onNewChat && (
              <button onClick={onNewChat} className="kitchen-button text-sm px-4 py-2">
                New Chat
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-kitchen-text-light">AI-powered response refinement</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
