import React from 'react';
import { motion } from 'framer-motion';

interface RemixResponseCardProps {
  index: number;
  children: React.ReactNode;
  onRef?: (el: HTMLDivElement | null) => void;
}

const RemixResponseCard: React.FC<RemixResponseCardProps> = ({ index, children, onRef }) => (
  <motion.div
    key={`remix-response-${index}`}
    ref={onRef}
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
    className="kitchen-card p-6 flex flex-col overflow-hidden w-full max-w-full flex-shrink-0 column-container"
  >
    {children}
  </motion.div>
);

export default RemixResponseCard;
