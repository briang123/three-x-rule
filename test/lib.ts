// Test library functions and DOM manipulation helpers
// This file contains complex test operations and DOM manipulation utilities

import { render, RenderResult } from '@testing-library/react';
import React from 'react';

// Custom render function with common setup
export const customRender = (
  ui: React.ReactElement,
  options: {
    container?: HTMLElement;
    baseElement?: HTMLElement;
    hydrate?: boolean;
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  } = {},
): RenderResult => {
  return render(ui, {
    ...options,
  });
};

// DOM element finders
export const findElementByTestId = (
  testId: string,
  container?: HTMLElement,
): HTMLElement | null => {
  return container
    ? container.querySelector(`[data-testid="${testId}"]`)
    : document.querySelector(`[data-testid="${testId}"]`);
};

export const findAllElementsByTestId = (testId: string, container?: HTMLElement): HTMLElement[] => {
  return container
    ? Array.from(container.querySelectorAll(`[data-testid="${testId}"]`))
    : Array.from(document.querySelectorAll(`[data-testid="${testId}"]`));
};

export const findElementByText = (
  text: string | RegExp,
  container?: HTMLElement,
): HTMLElement | null => {
  const elements = container
    ? Array.from(container.querySelectorAll('*'))
    : Array.from(document.querySelectorAll('*'));

  return elements.find((element) => {
    const elementText = element.textContent || '';
    return typeof text === 'string' ? elementText.includes(text) : text.test(elementText);
  }) as HTMLElement | null;
};

// Button finders
export const findSubmitButton = (container?: HTMLElement): HTMLButtonElement | null => {
  const buttons = container
    ? Array.from(container.querySelectorAll('button'))
    : Array.from(document.querySelectorAll('button'));

  return buttons.find(
    (button) => button.getAttribute('type') === 'submit',
  ) as HTMLButtonElement | null;
};

export const findButtonsByType = (type: string, container?: HTMLElement): HTMLButtonElement[] => {
  const buttons = container
    ? Array.from(container.querySelectorAll('button'))
    : Array.from(document.querySelectorAll('button'));

  return buttons.filter((button) => button.getAttribute('type') === type) as HTMLButtonElement[];
};

export const findFileAttachmentButton = (container?: HTMLElement): HTMLButtonElement | null => {
  const buttons = container
    ? Array.from(container.querySelectorAll('button'))
    : Array.from(document.querySelectorAll('button'));

  return buttons.find(
    (button) => button.innerHTML.includes('M12 4v16m8-8H4'), // Plus icon SVG path
  ) as HTMLButtonElement | null;
};

export const findRemoveButton = (container?: HTMLElement): HTMLButtonElement | null => {
  const buttons = container
    ? Array.from(container.querySelectorAll('button'))
    : Array.from(document.querySelectorAll('button'));

  return buttons.find((button) => button.textContent?.includes('×')) as HTMLButtonElement | null;
};

// Form element finders
export const findInputByName = (name: string, container?: HTMLElement): HTMLInputElement | null => {
  return container
    ? container.querySelector(`input[name="${name}"]`)
    : document.querySelector(`input[name="${name}"]`);
};

export const findTextareaByName = (
  name: string,
  container?: HTMLElement,
): HTMLTextAreaElement | null => {
  return container
    ? container.querySelector(`textarea[name="${name}"]`)
    : document.querySelector(`textarea[name="${name}"]`);
};

export const findSelectByName = (
  name: string,
  container?: HTMLElement,
): HTMLSelectElement | null => {
  return container
    ? container.querySelector(`select[name="${name}"]`)
    : document.querySelector(`select[name="${name}"]`);
};

// File input helpers
export const findFileInput = (container?: HTMLElement): HTMLInputElement | null => {
  return container
    ? container.querySelector('input[type="file"]')
    : document.querySelector('input[type="file"]');
};

export const simulateFileUpload = (fileInput: HTMLInputElement, files: File | File[]): void => {
  const fileList = Array.isArray(files) ? files : [files];
  const dataTransfer = new DataTransfer();

  fileList.forEach((file) => dataTransfer.items.add(file));
  fileInput.files = dataTransfer.files;

  // Trigger change event
  const event = new Event('change', { bubbles: true });
  fileInput.dispatchEvent(event);
};

// Modal and popover helpers
export const findModal = (container?: HTMLElement): HTMLElement | null => {
  return (
    findElementByTestId('confirmation-modal', container) ||
    findElementByTestId('modal', container) ||
    container?.querySelector('[role="dialog"]') ||
    document.querySelector('[role="dialog"]')
  );
};

export const findTooltip = (container?: HTMLElement): HTMLElement | null => {
  return (
    findElementByTestId('tooltip', container) ||
    container?.querySelector('[role="tooltip"]') ||
    document.querySelector('[role="tooltip"]')
  );
};

export const findPopover = (container?: HTMLElement): HTMLElement | null => {
  return (
    findElementByTestId('popover', container) ||
    container?.querySelector('[role="tooltip"]') ||
    document.querySelector('[role="tooltip"]')
  );
};

// Event simulation helpers
export const simulateClick = (element: HTMLElement): void => {
  element.click();
};

export const simulateHover = (element: HTMLElement): void => {
  element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
};

export const simulateUnhover = (element: HTMLElement): void => {
  element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
};

export const simulateFocus = (element: HTMLElement): void => {
  element.focus();
};

export const simulateBlur = (element: HTMLElement): void => {
  element.blur();
};

export const simulateKeyPress = (
  element: HTMLElement,
  key: string,
  options?: KeyboardEventInit,
): void => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
};

export const simulateKeyUp = (
  element: HTMLElement,
  key: string,
  options?: KeyboardEventInit,
): void => {
  element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, ...options }));
};

// Async helpers
export const waitForElement = async (
  finder: () => HTMLElement | null,
  timeout: number = 5000,
): Promise<HTMLElement> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = finder();
    if (element) {
      return element;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Element not found within ${timeout}ms`);
};

export const waitForElementToDisappear = async (
  finder: () => HTMLElement | null,
  timeout: number = 5000,
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = finder();
    if (!element) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Element still present after ${timeout}ms`);
};

// Validation helpers
export const validateElementAttributes = (
  element: HTMLElement,
  attributes: Record<string, string | boolean>,
): void => {
  Object.entries(attributes).forEach(([attr, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        expect(element).toHaveAttribute(attr);
      } else {
        expect(element).not.toHaveAttribute(attr);
      }
    } else {
      expect(element).toHaveAttribute(attr, value);
    }
  });
};

export const validateElementClasses = (element: HTMLElement, classes: string[]): void => {
  classes.forEach((className) => {
    expect(element).toHaveClass(className);
  });
};

// Test data generators
export const generateMockFiles = (count: number, baseName: string = 'file'): File[] => {
  return Array.from(
    { length: count },
    (_, index) => new File(['test content'], `${baseName}${index + 1}.txt`, { type: 'text/plain' }),
  );
};

export const generateMockModelSelections = (
  count: number,
): Array<{ modelId: string; count: number }> => {
  const models = ['gemini-2.5-flash-lite', 'gpt-4o', 'claude-3-sonnet'];
  return Array.from({ length: count }, (_, index) => ({
    modelId: models[index % models.length],
    count: Math.floor(Math.random() * 3) + 1,
  }));
};

// Export all library functions
export default {
  customRender,
  findElementByTestId,
  findAllElementsByTestId,
  findElementByText,
  findSubmitButton,
  findButtonsByType,
  findFileAttachmentButton,
  findRemoveButton,
  findInputByName,
  findTextareaByName,
  findSelectByName,
  findFileInput,
  simulateFileUpload,
  findModal,
  findTooltip,
  findPopover,
  simulateClick,
  simulateHover,
  simulateUnhover,
  simulateFocus,
  simulateBlur,
  simulateKeyPress,
  simulateKeyUp,
  waitForElement,
  waitForElementToDisappear,
  validateElementAttributes,
  validateElementClasses,
  generateMockFiles,
  generateMockModelSelections,
};
