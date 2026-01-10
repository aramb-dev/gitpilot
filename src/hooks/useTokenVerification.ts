'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import type { TokenVerificationResult } from '@/types/account';

interface UseTokenVerificationOptions {
  /** Interval in milliseconds for periodic verification. Set to 0 to disable. */
  interval?: number;
  /** Whether to automatically sign out on invalid token. Default: true */
  autoSignOut?: boolean;
  /** Callback when token is detected as invalid */
  onInvalid?: (error: TokenVerificationResult['error']) => void;
}

interface UseTokenVerificationReturn {
  isValid: boolean | null;
  isLoading: boolean;
  user: TokenVerificationResult['user'] | null;
  scopes: string[];
  rateLimitRemaining: number | null;
  error: TokenVerificationResult['error'] | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to verify the current session's GitHub token.
 * Calls /api/auth/verify on mount and optionally at intervals.
 */
export function useTokenVerification(
  options: UseTokenVerificationOptions = {}
): UseTokenVerificationReturn {
  const { interval = 0, autoSignOut = true, onInvalid } = options;

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<TokenVerificationResult['user'] | null>(null);
  const [scopes, setScopes] = useState<string[]>([]);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const [error, setError] = useState<TokenVerificationResult['error'] | null>(null);

  const verify = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify');
      const data: TokenVerificationResult = await response.json();

      setIsValid(data.valid);
      setUser(data.user ?? null);
      setScopes(data.scopes ?? []);
      setRateLimitRemaining(data.rateLimitRemaining ?? null);

      if (!data.valid) {
        setError(data.error ?? null);
        
        if (onInvalid) {
          onInvalid(data.error);
        }

        if (autoSignOut && data.error?.code === 'TOKEN_REVOKED') {
          await signOut({ callbackUrl: '/' });
        }
      }
    } catch (err) {
      setIsValid(false);
      setError({
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Failed to verify token',
      });
    } finally {
      setIsLoading(false);
    }
  }, [autoSignOut, onInvalid]);

  // Initial verification on mount
  useEffect(() => {
    verify();
  }, [verify]);

  // Periodic verification if interval is set
  useEffect(() => {
    if (interval <= 0) return;

    const timer = setInterval(verify, interval);
    return () => clearInterval(timer);
  }, [interval, verify]);

  return {
    isValid,
    isLoading,
    user,
    scopes,
    rateLimitRemaining,
    error,
    refetch: verify,
  };
}
