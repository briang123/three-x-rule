// Common test selectors for the application
// This file centralizes all test selectors to make tests more maintainable

// ChatInputMessage selectors
export const chatInputSelectors = {
  textarea: () => 'Ask anything...',
  submitButton: () => 'button[type="submit"]',
  fileAttachmentButton: () => 'button[aria-label*="+"]',
  fileInput: () => 'input[type="file"]',
  confirmationModal: () => '[data-testid="confirmation-modal"]',
  confirmButton: () => '[data-testid="confirm-button"]',
  cancelButton: () => '[data-testid="cancel-button"]',
  characterCount: () => /\/1000 characters/,
  helpText: () => /Press Enter to submit, Shift\+Enter for new line/,
} as const;

// StackedFileAttachments selectors
export const fileAttachmentSelectors = {
  fileButton: (fileName?: string) => (fileName ? new RegExp(fileName) : /file/),
  removeButton: () => 'button[aria-label*="Remove"]',
  fileInfo: () => '[data-testid="file-info"]',
  fileIcon: () => '[data-testid="file-icon"]',
  fileColor: () => '[data-testid="file-color"]',
  animatePresence: () => '[data-testid="animate-presence"]',
  filePopover: () => '[data-testid="file-popover"]',
  fileSize: () => /KB/,
  fileType: () => /text\/plain|application\/pdf|image\/jpeg/,
  actionText: {
    download: () => /Click to download/,
    view: () => /Click to view/,
  },
} as const;

// AnimatedModelBadges selectors
export const modelBadgeSelectors = {
  modelBadge: (modelId: string) => `[data-testid="model-badge-${modelId}"]`,
  changeModelsButton: () => '[data-testid="change-models-button"]',
  animatedModelBadges: () => '[data-testid="animated-model-badges"]',
  modelCount: () => /[0-9]+/,
} as const;

// RemixDropdown selectors
export const remixSelectors = {
  remixButton: () => '[data-testid="remix-button"]',
  remixDropdown: () => '[data-testid="remix-dropdown"]',
  remixOption: (modelId: string) => `[data-testid="remix-option-${modelId}"]`,
  remixLoading: () => '[data-testid="remix-loading"]',
  remixError: () => '[data-testid="remix-error"]',
  remixIcon: () => '[data-testid="remix-icon"]',
} as const;

// General UI selectors
export const uiSelectors = {
  loadingSpinner: () => '[data-testid="loading-spinner"]',
  errorMessage: () => '[data-testid="error-message"]',
  successMessage: () => '[data-testid="success-message"]',
  modal: () => '[data-testid="modal"]',
  tooltip: () => '[data-testid="tooltip"]',
  popover: () => '[data-testid="popover"]',
  backdrop: () => '[data-testid="backdrop"]',
  closeButton: () => '[data-testid="close-button"]',
} as const;

// Form selectors
export const formSelectors = {
  input: (name: string) => `input[name="${name}"]`,
  textarea: (name: string) => `textarea[name="${name}"]`,
  select: (name: string) => `select[name="${name}"]`,
  checkbox: (name: string) => `input[type="checkbox"][name="${name}"]`,
  radio: (name: string) => `input[type="radio"][name="${name}"]`,
  submitButton: () => 'button[type="submit"]',
  resetButton: () => 'button[type="reset"]',
  form: () => 'form',
  fieldset: () => 'fieldset',
  legend: () => 'legend',
} as const;

// Button selectors
export const buttonSelectors = {
  primaryButton: () => 'button[class*="bg-blue"]',
  secondaryButton: () => 'button[class*="bg-gray"]',
  dangerButton: () => 'button[class*="bg-red"]',
  successButton: () => 'button[class*="bg-green"]',
  iconButton: () => 'button[class*="w-8 h-8"]',
  disabledButton: () => 'button[disabled]',
  loadingButton: () => 'button[aria-busy="true"]',
} as const;

// Navigation selectors
export const navSelectors = {
  sidebar: () => '[data-testid="sidebar"]',
  sidebarToggle: () => '[data-testid="sidebar-toggle"]',
  navItem: (label: string) => `[data-testid="nav-item-${label}"]`,
  breadcrumb: () => '[data-testid="breadcrumb"]',
  breadcrumbItem: (index: number) => `[data-testid="breadcrumb-item-${index}"]`,
  menu: () => '[data-testid="menu"]',
  menuItem: (label: string) => `[data-testid="menu-item-${label}"]`,
} as const;

// Layout selectors
export const layoutSelectors = {
  header: () => '[data-testid="header"]',
  footer: () => '[data-testid="footer"]',
  main: () => '[data-testid="main"]',
  sidebar: () => '[data-testid="sidebar"]',
  content: () => '[data-testid="content"]',
  container: () => '[data-testid="container"]',
} as const;

// Status and state selectors
export const statusSelectors = {
  loading: () => '[data-testid="loading"]',
  error: () => '[data-testid="error"]',
  success: () => '[data-testid="success"]',
  warning: () => '[data-testid="warning"]',
  info: () => '[data-testid="info"]',
  empty: () => '[data-testid="empty"]',
  disabled: () => '[data-testid="disabled"]',
  hidden: () => '[data-testid="hidden"]',
} as const;

// Export all selectors for easy importing
export default {
  chatInput: chatInputSelectors,
  fileAttachment: fileAttachmentSelectors,
  modelBadge: modelBadgeSelectors,
  remix: remixSelectors,
  ui: uiSelectors,
  form: formSelectors,
  button: buttonSelectors,
  nav: navSelectors,
  layout: layoutSelectors,
  status: statusSelectors,
};
