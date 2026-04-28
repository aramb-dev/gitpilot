/**
 * GitHub API error classification and handling utilities.
 */

import type { ApiError, ApiErrorCode } from '@/types/api-errors';
import { getSecondsUntilReset, isRateLimited, parseRateLimitHeaders } from './client';

/**
 * Classifies a GitHub API response into an error code.
 * @param response - Fetch Response object
 * @returns ApiErrorCode based on response status and headers
 */
export function classifyGitHubError(response: Response): ApiErrorCode {
  const status = response.status;

  if (status === 401) {
    return 'UNAUTHORIZED';
  }

  if (status === 403) {
    if (isRateLimited(response)) {
      return 'RATE_LIMITED';
    }
    return 'FORBIDDEN';
  }

  if (status === 404) {
    return 'NOT_FOUND';
  }

  if (status >= 500) {
    return 'NETWORK_ERROR';
  }

  return 'NETWORK_ERROR';
}

/**
 * Creates a standardized API error object.
 * @param code - Error code
 * @param message - Human-readable error message
 * @param details - Optional additional details
 * @returns ApiError object
 */
export function createApiError(code: ApiErrorCode, message: string, details?: string): ApiError {
  return {
    code,
    message,
    ...(details && { details }),
  };
}

/**
 * Creates an API error from a GitHub API response.
 * Extracts rate limit info if applicable.
 * @param response - Fetch Response object
 * @param defaultMessage - Default message if none can be extracted
 * @returns ApiError object with appropriate fields
 */
export async function createApiErrorFromResponse(
  response: Response,
  defaultMessage: string = 'GitHub API error',
): Promise<ApiError> {
  const code = classifyGitHubError(response);

  let message = defaultMessage;
  let details: string | undefined;
  let retry_after: number | undefined;

  try {
    const body = await response.json();
    if (body.message) {
      message = body.message;
    }
    if (body.documentation_url) {
      details = `See: ${body.documentation_url}`;
    }
  } catch {
    // Body may not be JSON, use default message
  }

  if (code === 'RATE_LIMITED') {
    const rateLimitInfo = parseRateLimitHeaders(response);
    if (rateLimitInfo) {
      retry_after = getSecondsUntilReset(rateLimitInfo.reset);
      message = `Rate limit exceeded. Resets in ${retry_after} seconds.`;
    }
  }

  const error: ApiError = {
    code,
    message,
  };

  if (details) {
    error.details = details;
  }

  if (retry_after !== undefined) {
    error.retry_after = retry_after;
  }

  return error;
}

/**
 * Maps error codes to HTTP status codes for API responses.
 * @param code - ApiErrorCode
 * @returns HTTP status code
 */
export function errorCodeToHttpStatus(code: ApiErrorCode): number {
  switch (code) {
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'RATE_LIMITED':
      return 429;
    case 'NETWORK_ERROR':
      return 502;
    default:
      return 500;
  }
}

/**
 * User-friendly error messages for each error code.
 */
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: 'Session expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMITED: 'GitHub API rate limit exceeded. Please wait before retrying.',
  NETWORK_ERROR: 'Unable to connect to GitHub. Please try again later.',
};
