import { useState } from 'react';

interface AuroraConfig {
  colorStops: [string, string, string];
  speed: number;
  blend: number;
  amplitude: number;
}

const DEFAULT_AURORA_CONFIG: AuroraConfig = {
  colorStops: ['#1e74a9', '#97128c', '#05ecf0'],
  speed: 0.2,
  blend: 0.47,
  amplitude: 1.0,
};

export const useUIState = () => {
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isLeftNavCollapsed, setIsLeftNavCollapsed] = useState<boolean>(true);
  const [auroraConfig, setAuroraConfig] = useState<AuroraConfig>(DEFAULT_AURORA_CONFIG);

  return {
    showRightPanel,
    setShowRightPanel,
    isLeftNavCollapsed,
    setIsLeftNavCollapsed,
    auroraConfig,
    setAuroraConfig,
  };
};
