
/**
 * Error utilities for component error handling
 */

export interface ComponentError extends Error {
  component: string;
  context?: string;
  originalError?: unknown;
}

/**
 * Creates a standardized component error
 * @param component - The component name where the error occurred
 * @param message - Error message
 * @param originalError - The original error that was caught
 * @param context - Additional context about the error
 * @returns ComponentError object
 */
export function createComponentError(
  component,
  message,
  originalError?: unknown,
  context?: string,
): ComponentError {
  const error = new Error(message) as ComponentError;
  error.component = component;
  if (context !== undefined) {
    error.context = context;
  }
  if (originalError !== undefined) {
    error.originalError = originalError;
  }

  // Include original error message if available
  if (originalError instanceof Error) {
    error.message = `${message}: ${originalError.message}`;
    if (originalError.stack !== undefined) {
      error.stack = originalError.stack;
    }
  }

  return error;
}

/**
 * Creates an async operation error
 * @param component - The component name
 * @param operation - The operation that failed
 * @param originalError - The original error
 * @returns ComponentError object
 */
export function createAsyncError(
  component,
  operation,
  originalError?: unknown,
): ComponentError {
  return createComponentError(
    component,
    `Async operation failed: ${operation}`,
    originalError,
    'async',
  );
}

/**
 * Creates a network-related error
 * @param component - The component name
 * @param url - The URL that failed
 * @param originalError - The original error
 * @returns ComponentError object
 */
export function createNetworkError(
  component,
  url,
  originalError?: unknown,
): ComponentError {
  return createComponentError(
    component,
    `Network request failed: ${url}`,
    originalError,
    'network',
  );
}

/**
 * Creates a validation error
 * @param component - The component name
 * @param field - The field that failed validation
 * @param value - The invalid value
 * @returns ComponentError object
 */
export function createValidationError(
  component,
  field,
  value: unknown,
): ComponentError {
  return createComponentError(
    component,
    `Validation failed for field: ${field}`,
    new Error(`Invalid value: ${JSON.stringify(value)}`),
    'validation',
  );
}

/**
 * Safely extracts error message from unknown error
 * @param error - The error to extract message from
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Checks if an error is a ComponentError
 * @param error - The error to check
 * @returns True if error is a ComponentError
 */
export function isComponentError(error: unknown): error is ComponentError {
  return error instanceof Error && 'component' in error;
}