import { createErrorMessage } from './error-utils';

describe('createErrorMessage', () => {
  it('should return rate limit error message for 429 errors', () => {
    const error = new Error('HTTP error! status: 429 - Rate limit exceeded');
    const result = createErrorMessage(error);

    expect(result).toBe(
      'Rate limit exceeded. This model has reached its daily quota. Please try again later or use a different model.',
    );
  });

  it('should return rate limit error message for quota errors', () => {
    const error = new Error('Daily quota exceeded');
    const result = createErrorMessage(error);

    expect(result).toBe(
      'Rate limit exceeded. This model has reached its daily quota. Please try again later or use a different model.',
    );
  });

  it('should return rate limit error message for "Too Many Requests" errors', () => {
    const error = new Error('Too Many Requests');
    const result = createErrorMessage(error);

    expect(result).toBe(
      'Rate limit exceeded. This model has reached its daily quota. Please try again later or use a different model.',
    );
  });

  it('should return authentication error message for 401 errors', () => {
    const error = new Error('HTTP error! status: 401 - Unauthorized');
    const result = createErrorMessage(error);

    expect(result).toBe('Authentication error. Please check your API configuration.');
  });

  it('should return authentication error message for unauthorized errors', () => {
    const error = new Error('unauthorized access');
    const result = createErrorMessage(error);

    expect(result).toBe('Authentication error. Please check your API configuration.');
  });

  it('should return server error message for 500 errors', () => {
    const error = new Error('HTTP error! status: 500 - Internal Server Error');
    const result = createErrorMessage(error);

    expect(result).toBe('Server error. Please try again in a few moments.');
  });

  it('should return server error message for internal server error', () => {
    const error = new Error('internal server error occurred');
    const result = createErrorMessage(error);

    expect(result).toBe('Server error. Please try again in a few moments.');
  });

  it('should return network error message for network errors', () => {
    const error = new Error('network error occurred');
    const result = createErrorMessage(error);

    expect(result).toBe('Network error. Please check your internet connection and try again.');
  });

  it('should return network error message for fetch errors', () => {
    const error = new Error('fetch failed');
    const result = createErrorMessage(error);

    expect(result).toBe('Network error. Please check your internet connection and try again.');
  });

  it('should return generic error message for unknown errors', () => {
    const error = new Error('Some unknown error occurred');
    const result = createErrorMessage(error);

    expect(result).toBe('An error occurred while generating the response.');
  });

  it('should return generic error message for empty error message', () => {
    const error = new Error('');
    const result = createErrorMessage(error);

    expect(result).toBe('An error occurred while generating the response.');
  });

  it('should handle case-sensitive error messages', () => {
    const error = new Error('NETWORK ERROR');
    const result = createErrorMessage(error);

    expect(result).toBe('An error occurred while generating the response.');
  });

  it('should handle mixed case error messages', () => {
    const error = new Error('Internal Server Error');
    const result = createErrorMessage(error);

    expect(result).toBe('An error occurred while generating the response.');
  });

  it('should handle partial matches in error messages', () => {
    const error = new Error('The request failed due to quota limits being exceeded');
    const result = createErrorMessage(error);

    expect(result).toBe(
      'Rate limit exceeded. This model has reached its daily quota. Please try again later or use a different model.',
    );
  });

  it('should handle multiple error conditions in one message', () => {
    const error = new Error('HTTP error! status: 429 - Rate limit exceeded and quota exceeded');
    const result = createErrorMessage(error);

    expect(result).toBe(
      'Rate limit exceeded. This model has reached its daily quota. Please try again later or use a different model.',
    );
  });
});
