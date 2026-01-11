/**
 * API error types for GitPilot.
 * Standardized error handling across all API routes.
 */

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: string;
  retry_after?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  warnings?: string[];
  meta?: {
    fromCache?: boolean;
    [key: string]: unknown;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
