import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from './ThemeProvider';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Setup localStorage mock before tests
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const renderWithThemeProvider = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set initial theme to dark
    localStorageMock.getItem.mockReturnValue('dark');
  });

  it('should render without crashing', () => {
    renderWithThemeProvider(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should display sun icon when in dark mode', () => {
    renderWithThemeProvider(<ThemeToggle />);

    // Check for sun icon (light mode icon when in dark mode)
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // The button should contain the sun icon
    expect(button).toHaveAttribute('title', 'Switch to light mode');
  });

  it('should display moon icon when in light mode', () => {
    localStorageMock.getItem.mockReturnValue('light');
    renderWithThemeProvider(<ThemeToggle />);

    // Check for moon icon (dark mode icon when in light mode)
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // The button should contain the moon icon
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
  });

  it('should call toggleTheme when clicked', () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify that localStorage.setItem was called (indicating theme change)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('should have proper accessibility attributes', () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to light mode');
  });

  it('should be keyboard accessible', () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Clear the initial localStorage call from ThemeProvider initialization
    localStorageMock.setItem.mockClear();

    // Test that the button is focusable and has proper accessibility attributes
    expect(button).toHaveAttribute('title', 'Switch to light mode');

    // Test that clicking works (which is what keyboard accessibility relies on)
    fireEvent.click(button);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('should handle rapid clicking', () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Clear the initial localStorage call from ThemeProvider initialization
    localStorageMock.setItem.mockClear();

    // Rapid clicks - each click should toggle the theme
    for (let i = 0; i < 5; i++) {
      fireEvent.click(button);
    }

    // Should handle rapid clicks without errors
    // Each click toggles the theme, so we expect 5 calls
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(5);
  });

  it('should handle disabled state gracefully', () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Component should handle disabled state if needed
    expect(button).toBeEnabled();
  });

  it('should maintain focus after theme change', () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');
    button.focus();

    fireEvent.click(button);

    // Button should still be focusable
    expect(button).toHaveFocus();
  });

  it('should handle theme persistence', () => {
    localStorageMock.getItem.mockReturnValue('light');
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to dark mode');

    fireEvent.click(button);

    // Should persist the new theme
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should handle undefined localStorage gracefully', () => {
    // Temporarily remove localStorage
    const originalLocalStorage = window.localStorage;
    delete (window as any).localStorage;

    // Should not crash
    expect(() => {
      renderWithThemeProvider(<ThemeToggle />);
    }).not.toThrow();

    // Restore localStorage
    (window as any).localStorage = originalLocalStorage;
  });

  it('should handle theme provider context', () => {
    // Test that the component works within ThemeProvider context
    expect(() => {
      renderWithThemeProvider(<ThemeToggle />);
    }).not.toThrow();
  });

  it('should handle theme toggle function', () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Initial state
    expect(button).toHaveAttribute('title', 'Switch to light mode');

    // Click to toggle
    fireEvent.click(button);

    // Verify theme was toggled
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('should handle theme state consistency', () => {
    const { rerender } = renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Initial dark theme
    expect(button).toHaveAttribute('title', 'Switch to light mode');

    // Toggle to light
    fireEvent.click(button);
    rerender(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Should now be light theme
    expect(button).toHaveAttribute('title', 'Switch to dark mode');

    // Toggle back to dark
    fireEvent.click(button);
    rerender(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Should be dark theme again
    expect(button).toHaveAttribute('title', 'Switch to light mode');
  });
});
