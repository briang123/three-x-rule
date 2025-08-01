import { useState, useCallback, useEffect, useRef } from 'react';
import { ModelSelection } from '@/components/ModelGridSelector';

interface UseModelOrchestrationProps {
  showAISelection?: boolean;
  onToggleAISelection?: () => void;
  onRestoreModelSelection?: () => void;
  resetModelSelector?: boolean;
  modelSelections?: ModelSelection[];
  hasAIContent?: boolean;
  onSubmit?: (prompt: string, attachments?: File[]) => void;
}

interface UseModelOrchestrationReturn {
  showModelBadges: boolean;
  hasSubmitted: boolean;
  handleSubmitWithOrchestration: (prompt: string, attachments?: File[]) => Promise<void>;
  handleRestoreModelSelection: () => void;
  handleModelConfirmedOrchestration: () => void;
  handleModelSelectorAnimationComplete: () => void;
}

export const useModelOrchestration = ({
  showAISelection = true,
  onToggleAISelection,
  onRestoreModelSelection,
  resetModelSelector = false,
  modelSelections = [],
  hasAIContent = false,
  onSubmit,
}: UseModelOrchestrationProps): UseModelOrchestrationReturn => {
  // Orchestration state
  const [showModelBadges, setShowModelBadges] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Orchestration handlers
  const handleSubmitWithOrchestration = useCallback(
    async (prompt: string, attachments?: File[]) => {
      if (!hasSubmitted) {
        setHasSubmitted(true);
        // Call the parent onSubmit if provided
        if (onSubmit) {
          onSubmit(prompt, attachments);
        }
      }
    },
    [hasSubmitted, onSubmit],
  );

  const handleRestoreModelSelection = useCallback(() => {
    setShowModelBadges(false);
    setHasSubmitted(false);
    if (onRestoreModelSelection) {
      onRestoreModelSelection();
    }
  }, [onRestoreModelSelection]);

  // Handle orchestration when models are confirmed from modal
  const handleModelConfirmedOrchestration = useCallback(() => {
    setHasSubmitted(true);
    // The actual prompt and modelId will be handled by the pending orchestration mechanism
  }, []);

  const handleModelSelectorAnimationComplete = useCallback(() => {
    // This will be called when the ModelGridSelector animation completes
  }, []);

  // Auto-hide AI selection when content is received
  useEffect(() => {
    if (hasAIContent && showAISelection && onToggleAISelection) {
      onToggleAISelection();
    }
  }, [hasAIContent, showAISelection, onToggleAISelection]);

  // Reset model selector state when resetModelSelector prop changes
  useEffect(() => {
    if (resetModelSelector) {
      setShowModelBadges(false);
      setHasSubmitted(false);
    }
  }, [resetModelSelector]);

  // Reset model selector when showAISelection becomes true
  useEffect(() => {
    if (showAISelection) {
      setShowModelBadges(false);
      setHasSubmitted(false);
    }
  }, [showAISelection]);

  // Show model badges when modelSelections are updated and AI selection is closed
  useEffect(() => {
    if (modelSelections.length > 0 && !showAISelection) {
      setShowModelBadges(true);
    }
  }, [modelSelections, showAISelection]);

  return {
    showModelBadges,
    hasSubmitted,
    handleSubmitWithOrchestration,
    handleRestoreModelSelection,
    handleModelConfirmedOrchestration,
    handleModelSelectorAnimationComplete,
  };
};
