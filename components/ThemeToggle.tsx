'use client';

import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-kitchen-light-gray dark:bg-kitchen-dark-surface-light hover:bg-gray-200 dark:hover:bg-kitchen-dark-surface transition-colors duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <MoonIcon />
      ) : (
        // Sun icon for light mode
        <SunIcon />
      )}
    </motion.button>
  );
}
