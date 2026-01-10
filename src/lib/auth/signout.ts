/**
 * Enhanced sign-out utilities for GitPilot.
 */

import { signOut } from 'next-auth/react';

const LOCAL_STORAGE_KEYS_TO_CLEAR = [
  'selected_orgs',
  'gitpilot_preferences',
  'gitpilot_cache',
];

/**
 * Clears all GitPilot-related data from localStorage.
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    LOCAL_STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch {
    // Ignore localStorage errors (e.g., in private browsing)
  }
}

/**
 * Performs a complete sign-out, clearing all local state and redirecting.
 * @param callbackUrl - URL to redirect to after sign-out (default: '/')
 */
export async function handleSignOut(callbackUrl = '/'): Promise<void> {
  // Clear local storage first
  clearLocalStorage();

  // Sign out via NextAuth
  await signOut({ callbackUrl });
}

/**
 * Signs out and shows a toast message (for use in components with toast access).
 * @param showToast - Function to show a toast notification
 * @param callbackUrl - URL to redirect to after sign-out
 */
export async function handleSignOutWithToast(
  showToast: (message: string) => void,
  callbackUrl = '/'
): Promise<void> {
  showToast('Signing out...');
  await handleSignOut(callbackUrl);
}
