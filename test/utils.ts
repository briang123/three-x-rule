// Test utilities and helper functions
// This file contains common test utilities, mock functions, and test data

import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { ModelInfo } from '@/lib/api-client';

// Custom render function for React 18 compatibility
export const customRender = (
  ui: React.ReactElement,
  options: {
    container?: HTMLElement;
    baseElement?: HTMLElement;
    hydrate?: boolean;
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  } = {},
): RenderResult => {
  // Ensure we have a proper container
  const container = options.container || document.createElement('div');
  if (!document.body.contains(container)) {
    document.body.appendChild(container);
  }
  
  return render(ui, {
    container,
    ...options,
  });
};

// Mock file data for testing
export const createMockFile = (name: string, type: string, content: string = 'test content') => {
  return new File([content], name, { type });
};

export const mockFiles = {
  text: createMockFile('test.txt', 'text/plain'),
  pdf: createMockFile('document.pdf', 'application/pdf'),
  image: createMockFile('image.jpg', 'image/jpeg'),
  word: createMockFile('document.doc', 'application/msword'),
  excel: createMockFile('spreadsheet.xls', 'application/vnd.ms-excel'),
  markdown: createMockFile('readme.md', 'text/markdown'),
  unknown: createMockFile('file.xyz', ''),
};

// Mock model data for testing
export const mockModels: ModelInfo[] = [
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Fast and efficient model for quick responses',
    maxInputTokens: 1000000,
    maxOutputTokens: 8192,
    supportsImages: true,
    supportsVideo: false,
    supportsAudio: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Balanced model for general use',
    maxInputTokens: 1000000,
    maxOutputTokens: 8192,
    supportsImages: true,
    supportsVideo: false,
    supportsAudio: false,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Advanced model for complex tasks',
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    supportsImages: true,
    supportsVideo: false,
    supportsAudio: false,
  },
];

// Mock functions for testing
export const mockFunctions = {
  onSubmit: jest.fn(),
  onRemove: jest.fn(),
  onView: jest.fn(),
  onModelSelect: jest.fn(),
  onModelSelectionsUpdate: jest.fn(),
  onDirectSubmit: jest.fn(),
  onRestoreModelSelection: jest.fn(),
  onModelConfirmedOrchestration: jest.fn(),
  onToggleAISelection: jest.fn(),
  onRemix: jest.fn(),
  getFileIcon: jest.fn(),
  getFileColor: jest.fn((file: File) => {
    if (file.type.startsWith('image/'))
      return 'text-purple-500 bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-700';
    if (file.type === 'application/pdf')
      return 'text-red-500 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-700';
    if (file.type.includes('word'))
      return 'text-green-500 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-700';
    if (file.type.includes('excel') || file.type.includes('spreadsheet'))
      return 'text-orange-500 bg-orange-100 dark:bg-orange-900 border-orange-200 dark:border-orange-700';
    return 'text-blue-500 bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-700';
  }),
};

// Test setup utilities
export const setupTestEnvironment = () => {
  // Mock URL.createObjectURL and URL.revokeObjectURL
  global.URL.createObjectURL = jest.fn(() => 'mocked-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock window.open
  global.window.open = jest.fn();

  // Mock document.createElement and appendChild for download functionality
  const mockCreateElement = jest.fn();
  const mockAppendChild = jest.fn();
  const mockRemoveChild = jest.fn();
  const mockClick = jest.fn();

  Object.defineProperty(document, 'createElement', {
    value: mockCreateElement,
    writable: true,
  });

  Object.defineProperty(document.body, 'appendChild', {
    value: mockAppendChild,
    writable: true,
  });

  Object.defineProperty(document.body, 'removeChild', {
    value: mockRemoveChild,
    writable: true,
  });

  // Mock alert
  global.alert = jest.fn();

  return {
    mockCreateElement,
    mockAppendChild,
    mockRemoveChild,
    mockClick,
  };
};

// Test cleanup utilities
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
};

// Common test data
export const testData = {
  modelSelections: [
    { modelId: 'gemini-2.5-flash-lite', count: 1 },
    { modelId: 'gpt-4o', count: 2 },
  ],
  attachments: [mockFiles.text, mockFiles.pdf, mockFiles.image],
  currentMessage: 'Test message for AI processing',
  selectedModelId: 'gemini-2.5-flash-lite',
};

// Test assertions utilities
export const assertElementExists = (element: HTMLElement | null, name: string) => {
  expect(element).toBeInTheDocument();
};

export const assertElementHasClass = (element: HTMLElement, className: string) => {
  expect(element).toHaveClass(className);
};

export const assertElementHasText = (element: HTMLElement, text: string | RegExp) => {
  expect(element).toHaveTextContent(text);
};

export const assertFunctionCalled = (mockFn: jest.Mock, times: number = 1) => {
  expect(mockFn).toHaveBeenCalledTimes(times);
};

export const assertFunctionCalledWith = (mockFn: jest.Mock, ...args: any[]) => {
  expect(mockFn).toHaveBeenCalledWith(...args);
};

// Test constants
export const TEST_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: [
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ],
  MAX_MESSAGE_LENGTH: 1000,
  MAX_ATTACHMENTS: 10,
} as const;
