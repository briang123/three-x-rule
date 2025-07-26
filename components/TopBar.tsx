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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start h-16">
          <div className="flex items-center space-x-4">
            {onNewChat && (
              <button onClick={onNewChat} className="kitchen-button text-sm px-4 py-2">
                New Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
