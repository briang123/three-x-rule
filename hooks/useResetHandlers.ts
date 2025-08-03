import { useCallback } from 'react';

interface UseResetHandlersProps {
  resetChatState: () => void;
  resetRemixState: () => void;
  resetSocialPostsState: () => void;
  resetModelSelectionState: () => void;
}

export const useResetHandlers = ({
  resetChatState,
  resetRemixState,
  resetSocialPostsState,
  resetModelSelectionState,
}: UseResetHandlersProps) => {
  const handleNewChat = useCallback(() => {
    resetChatState();
    resetRemixState();
    resetSocialPostsState();
    resetModelSelectionState();
  }, [resetChatState, resetRemixState, resetSocialPostsState, resetModelSelectionState]);

  return {
    handleNewChat,
  };
};
