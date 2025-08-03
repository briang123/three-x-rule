import { useEffect } from 'react';
import { PendingOrchestration } from '@/lib/types';

interface UseEffectsProps {
  pendingOrchestration: PendingOrchestration | null;
  setPendingOrchestration: React.Dispatch<React.SetStateAction<PendingOrchestration | null>>;
  modelSelections: any[];
  handleDirectSubmit: (prompt: string, modelId: string) => Promise<void>;
  setShowModelSelectionModal: (show: boolean) => void;
}

export const useEffects = ({
  pendingOrchestration,
  setPendingOrchestration,
  modelSelections,
  handleDirectSubmit,
  setShowModelSelectionModal,
}: UseEffectsProps) => {
  // Handle pending orchestration when model selections change
  useEffect(() => {
    if (pendingOrchestration && modelSelections.length > 0) {
      const { prompt, modelId } = pendingOrchestration;
      setPendingOrchestration(null);
      handleDirectSubmit(prompt, modelId);
    }
  }, [modelSelections, pendingOrchestration, handleDirectSubmit, setPendingOrchestration]);

  // Show model selection modal on initial load
  useEffect(() => {
    setShowModelSelectionModal(true);
  }, [setShowModelSelectionModal]);
};
