'use client';

import { useState, useCallback } from 'react';
import { handleSignOut } from '@/lib/auth/signout';

interface UseSignOutOptions {
  callbackUrl?: string;
  onSignOutStart?: () => void;
}

interface UseSignOutReturn {
  signOut: () => Promise<void>;
  isSigningOut: boolean;
}

/**
 * Hook for handling sign-out with loading state.
 */
export function useSignOut(options: UseSignOutOptions = {}): UseSignOutReturn {
  const { callbackUrl = '/', onSignOutStart } = options;
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    if (isSigningOut) return; // Prevent double-clicks

    setIsSigningOut(true);
    onSignOutStart?.();

    try {
      await handleSignOut(callbackUrl);
    } catch {
      // If sign-out fails, reset state
      setIsSigningOut(false);
    }
    // Note: We don't reset isSigningOut on success because we're redirecting
  }, [callbackUrl, isSigningOut, onSignOutStart]);

  return {
    signOut,
    isSigningOut,
  };
}
