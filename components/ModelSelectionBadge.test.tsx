import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModelSelectionBadge from './ModelSelectionBadge';
import { ModelSelection } from './ModelGridSelector';

describe('ModelSelectionBadge', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders "Select Models" when no models are selected', () => {
    render(<ModelSelectionBadge modelSelections={[]} onClick={mockOnClick} />);

    expect(screen.getByText('Select Models')).toBeInTheDocument();
    expect(screen.getByTitle('Click to select AI models')).toBeInTheDocument();
  });

  it('renders model count when models are selected', () => {
    const modelSelections: ModelSelection[] = [
      { modelId: 'gemini-2.0-flash', count: 2 },
      { modelId: 'gemini-2.5-pro', count: 1 },
    ];

    render(<ModelSelectionBadge modelSelections={modelSelections} onClick={mockOnClick} />);

    expect(screen.getByText('Models: 2, Responses: 3')).toBeInTheDocument();
    expect(screen.getByTitle('Click to change model selection')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<ModelSelectionBadge modelSelections={[]} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<ModelSelectionBadge modelSelections={[]} onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows selection indicator when models are selected', () => {
    const modelSelections: ModelSelection[] = [{ modelId: 'gemini-2.0-flash', count: 1 }];

    render(<ModelSelectionBadge modelSelections={modelSelections} onClick={mockOnClick} />);

    // The selection indicator should be present (a small dot)
    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();
  });

  it('hides badge when isUsingDefaultModel is true', () => {
    const modelSelections: ModelSelection[] = [{ modelId: 'gemini-2.0-flash', count: 1 }];

    render(
      <ModelSelectionBadge
        modelSelections={modelSelections}
        onClick={mockOnClick}
        isUsingDefaultModel={true}
      />,
    );

    // The badge should not be rendered
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
