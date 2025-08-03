export const createErrorMessage = (error: Error): string => {
  if (
    error.message.includes('429') ||
    error.message.includes('quota') ||
    error.message.includes('Too Many Requests')
  ) {
    return 'Rate limit exceeded. This model has reached its daily quota. Please try again later or use a different model.';
  }
  if (error.message.includes('401') || error.message.includes('unauthorized')) {
    return 'Authentication error. Please check your API configuration.';
  }
  if (error.message.includes('500') || error.message.includes('internal server error')) {
    return 'Server error. Please try again in a few moments.';
  }
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  return 'An error occurred while generating the response.';
};
