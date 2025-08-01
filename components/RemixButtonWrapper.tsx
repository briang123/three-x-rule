import React from 'react';
import { motion } from 'framer-motion';
import RemixButtonCard from './RemixButtonCard';

interface RemixButtonWrapperProps {
  onRemix: (modelId: string) => void;
  onRemixStart: () => void;
  disabled: boolean;
  isGenerating: boolean;
  responseCount: number;
}

const RemixButtonWrapper: React.FC<RemixButtonWrapperProps> = ({
  onRemix,
  onRemixStart,
  disabled,
  isGenerating,
  responseCount,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
    className="w-full"
  >
    <RemixButtonCard
      onRemix={onRemix}
      onRemixStart={onRemixStart}
      disabled={disabled}
      isGenerating={isGenerating}
      responseCount={responseCount}
    />
  </motion.div>
);

export default RemixButtonWrapper;
