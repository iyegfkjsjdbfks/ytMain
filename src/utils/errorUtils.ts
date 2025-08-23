// Error Utils - Minimal Implementation
export interface ComponentError extends Error {
  component: string;
  props?: Record<string, any>;
  stack?: string;
}

export interface AsyncError extends Error {
  operation: string;
  retryable: boolean;
}

export interface NetworkError extends Error {
  url: string;
  status?: number;
  timeout?: boolean;
}

export interface ValidationError extends Error {
  field: string;
  value: any;
  constraint: string;
}

export function createComponentError(
  message: string,
  component: string,
  props?: Record<string, any>
): ComponentError {
  const error = new Error(message) as ComponentError;
  error.name = 'ComponentError';
  error.component = component;
  error.props = props;
  return error;
}

export function createAsyncError(
  message: string,
  operation: string,
  retryable = false
): AsyncError {
  const error = new Error(message) as AsyncError;
  error.name = 'AsyncError';
  error.operation = operation;
  error.retryable = retryable;
  return error;
}

export function createNetworkError(
  message: string,
  url: string,
  status?: number,
  timeout?: boolean
): NetworkError {
  const error = new Error(message) as NetworkError;
  error.name = 'NetworkError';
  error.url = url;
  error.status = status;
  error.timeout = timeout;
  return error;
}

export function createValidationError(
  message: string,
  field: string,
  value: any,
  constraint: string
): ValidationError {
  const error = new Error(message) as ValidationError;
  error.name = 'ValidationError';
  error.field = field;
  error.value = value;
  error.constraint = constraint;
  return error;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}