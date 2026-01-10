import { describe, expect, it } from 'bun:test';
import {
  classifyGitHubError,
  createApiError,
  createApiErrorFromResponse,
  errorCodeToHttpStatus,
  ERROR_MESSAGES,
} from './errors';

describe('classifyGitHubError', () => {
  it('returns UNAUTHORIZED for 401', () => {
    const response = new Response(null, { status: 401 });
    expect(classifyGitHubError(response)).toBe('UNAUTHORIZED');
  });

  it('returns RATE_LIMITED for 403 with zero remaining', () => {
    const response = new Response(null, {
      status: 403,
      headers: { 'X-RateLimit-Remaining': '0' },
    });
    expect(classifyGitHubError(response)).toBe('RATE_LIMITED');
  });

  it('returns FORBIDDEN for 403 without rate limit', () => {
    const response = new Response(null, {
      status: 403,
      headers: { 'X-RateLimit-Remaining': '100' },
    });
    expect(classifyGitHubError(response)).toBe('FORBIDDEN');
  });

  it('returns FORBIDDEN for 403 without headers', () => {
    const response = new Response(null, { status: 403 });
    expect(classifyGitHubError(response)).toBe('FORBIDDEN');
  });

  it('returns NOT_FOUND for 404', () => {
    const response = new Response(null, { status: 404 });
    expect(classifyGitHubError(response)).toBe('NOT_FOUND');
  });

  it('returns NETWORK_ERROR for 500', () => {
    const response = new Response(null, { status: 500 });
    expect(classifyGitHubError(response)).toBe('NETWORK_ERROR');
  });

  it('returns NETWORK_ERROR for 502', () => {
    const response = new Response(null, { status: 502 });
    expect(classifyGitHubError(response)).toBe('NETWORK_ERROR');
  });

  it('returns NETWORK_ERROR for 503', () => {
    const response = new Response(null, { status: 503 });
    expect(classifyGitHubError(response)).toBe('NETWORK_ERROR');
  });
});

describe('createApiError', () => {
  it('creates error with code and message', () => {
    const error = createApiError('UNAUTHORIZED', 'Test message');
    
    expect(error).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Test message',
    });
  });

  it('includes details when provided', () => {
    const error = createApiError('FORBIDDEN', 'Test message', 'Extra details');
    
    expect(error).toEqual({
      code: 'FORBIDDEN',
      message: 'Test message',
      details: 'Extra details',
    });
  });

  it('omits details when undefined', () => {
    const error = createApiError('NOT_FOUND', 'Not found');
    
    expect(error.details).toBeUndefined();
  });
});

describe('createApiErrorFromResponse', () => {
  it('extracts message from JSON body', async () => {
    const response = new Response(
      JSON.stringify({ message: 'Bad credentials' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );

    const error = await createApiErrorFromResponse(response);

    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Bad credentials');
  });

  it('uses default message for non-JSON response', async () => {
    const response = new Response('Not JSON', { status: 500 });

    const error = await createApiErrorFromResponse(response, 'Default error');

    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Default error');
  });

  it('includes retry_after for rate limited response', async () => {
    const futureReset = Math.floor(Date.now() / 1000) + 3600;
    const response = new Response(
      JSON.stringify({ message: 'Rate limit exceeded' }),
      {
        status: 403,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Limit': '5000',
          'X-RateLimit-Reset': futureReset.toString(),
        },
      }
    );

    const error = await createApiErrorFromResponse(response);

    expect(error.code).toBe('RATE_LIMITED');
    expect(error.retry_after).toBeGreaterThan(3500);
  });

  it('includes documentation URL as details', async () => {
    const response = new Response(
      JSON.stringify({
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest',
      }),
      { status: 404 }
    );

    const error = await createApiErrorFromResponse(response);

    expect(error.details).toBe('See: https://docs.github.com/rest');
  });
});

describe('errorCodeToHttpStatus', () => {
  it('maps UNAUTHORIZED to 401', () => {
    expect(errorCodeToHttpStatus('UNAUTHORIZED')).toBe(401);
  });

  it('maps FORBIDDEN to 403', () => {
    expect(errorCodeToHttpStatus('FORBIDDEN')).toBe(403);
  });

  it('maps NOT_FOUND to 404', () => {
    expect(errorCodeToHttpStatus('NOT_FOUND')).toBe(404);
  });

  it('maps RATE_LIMITED to 429', () => {
    expect(errorCodeToHttpStatus('RATE_LIMITED')).toBe(429);
  });

  it('maps NETWORK_ERROR to 502', () => {
    expect(errorCodeToHttpStatus('NETWORK_ERROR')).toBe(502);
  });
});

describe('ERROR_MESSAGES', () => {
  it('has messages for all error codes', () => {
    expect(ERROR_MESSAGES.UNAUTHORIZED).toBeDefined();
    expect(ERROR_MESSAGES.FORBIDDEN).toBeDefined();
    expect(ERROR_MESSAGES.NOT_FOUND).toBeDefined();
    expect(ERROR_MESSAGES.RATE_LIMITED).toBeDefined();
    expect(ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
  });
});
