# useModelOrchestration Hook

## Overview

The `useModelOrchestration` hook extracts complex orchestration logic from the `ChatMessages` component to manage the state and flow of AI model selection, submission, and UI interactions.

## Purpose

This hook centralizes the orchestration logic that was previously scattered throughout the `ChatMessages` component, making the code more maintainable and testable.

## Features

- **State Management**: Manages `showModelBadges` and `hasSubmitted` states
- **Submit Orchestration**: Handles the submission flow with proper state management
- **Model Selection**: Manages model selection restoration and confirmation
- **Auto-hide Logic**: Automatically hides AI selection when content is received
- **Reset Functionality**: Resets state when model selector is reset or AI selection is shown

## API

### Props

```typescript
interface UseModelOrchestrationProps {
  showAISelection?: boolean;
  onToggleAISelection?: () => void;
  onRestoreModelSelection?: () => void;
  resetModelSelector?: boolean;
  modelSelections?: ModelSelection[];
  hasAIContent?: boolean;
  onSubmit?: (prompt: string, attachments?: File[]) => void;
}
```

### Return Value

```typescript
interface UseModelOrchestrationReturn {
  showModelBadges: boolean;
  hasSubmitted: boolean;
  handleSubmitWithOrchestration: (prompt: string, attachments?: File[]) => Promise<void>;
  handleRestoreModelSelection: () => void;
  handleModelConfirmedOrchestration: () => void;
  handleModelSelectorAnimationComplete: () => void;
}
```

## Usage

```typescript
import { useModelOrchestration } from '@/hooks/useModelOrchestration';

const MyComponent = () => {
  const {
    showModelBadges,
    hasSubmitted,
    handleSubmitWithOrchestration,
    handleRestoreModelSelection,
    handleModelConfirmedOrchestration,
    handleModelSelectorAnimationComplete,
  } = useModelOrchestration({
    showAISelection,
    onToggleAISelection,
    onRestoreModelSelection,
    resetModelSelector,
    modelSelections,
    hasAIContent,
    onSubmit,
  });

  // Use the returned values and functions
};
```

## Behavior

### Submit Orchestration

- Prevents multiple submissions by tracking `hasSubmitted` state
- Calls the parent `onSubmit` function when a submission is made
- Manages the submission flow state

### Model Selection Management

- Shows model badges when selections are updated and AI selection is closed
- Restores model selection state when needed
- Handles model confirmation orchestration

### Auto-hide Logic

- Automatically hides AI selection when content is received
- Resets state when model selector is reset
- Resets state when AI selection becomes visible

## Testing

The hook includes comprehensive tests covering:

- Initial state values
- Submit orchestration flow
- State reset functionality
- Auto-hide behavior
- Model selection management

Run tests with:

```bash
npm test -- hooks/useModelOrchestration.test.ts
```

## Benefits

1. **Separation of Concerns**: Orchestration logic is separated from UI rendering
2. **Reusability**: The hook can be used in other components if needed
3. **Testability**: Logic is isolated and easily testable
4. **Maintainability**: Changes to orchestration logic are centralized
5. **Readability**: The `ChatMessages` component is now cleaner and more focused
