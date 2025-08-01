import React from 'react';

interface SpaceBufferProps {
  height?: string;
  className?: string;
}

const SpaceBuffer: React.FC<SpaceBufferProps> = ({ height = 'h-32', className = '' }) => {
  return <div className={`${height} ${className}`}></div>;
};

export default SpaceBuffer;
