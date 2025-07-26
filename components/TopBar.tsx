'use client';

import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import RemixDropdown from './RemixDropdown';

interface TopBarProps {
  onNewChat?: () => void;
  onRemix?: (modelId: string) => void;
  remixDisabled?: boolean;
}

export default function TopBar({ onNewChat, onRemix, remixDisabled = false }: TopBarProps) {
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
            {onRemix && <RemixDropdown onRemix={onRemix} disabled={remixDisabled} />}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
