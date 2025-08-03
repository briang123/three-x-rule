import { useState, useCallback } from 'react';
import { ModelSelection } from '@/components/ModelGridSelector';

export const useModelSelectionState = () => {
  const [modelSelections, setModelSelections] = useState<ModelSelection[]>([]);
  const [showAISelection, setShowAISelection] = useState<boolean>(true);
  const [resetModelSelector, setResetModelSelector] = useState<boolean>(false);
  const [showModelSelectionModal, setShowModelSelectionModal] = useState<boolean>(false);
  const [isUsingDefaultModel, setIsUsingDefaultModel] = useState<boolean>(false);

  const resetModelSelectionState = useCallback(() => {
    setModelSelections([]);
    setShowModelSelectionModal(true);
    setIsUsingDefaultModel(false);
    setResetModelSelector(true);
    setTimeout(() => setResetModelSelector(false), 100);
  }, []);

  return {
    modelSelections,
    setModelSelections,
    showAISelection,
    setShowAISelection,
    resetModelSelector,
    setResetModelSelector,
    showModelSelectionModal,
    setShowModelSelectionModal,
    isUsingDefaultModel,
    setIsUsingDefaultModel,
    resetModelSelectionState,
  };
};
