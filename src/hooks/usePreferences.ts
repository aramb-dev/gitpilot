'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { UserPreferences } from '@/db/preferences';

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }
      const data = await response.json();
      setPreferences(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (updates: Partial<Omit<UserPreferences, 'userId'>>) => {
    // Optimistic update
    const previousPreferences = preferences;
    if (preferences) {
      setPreferences({ ...preferences, ...updates });
    }

    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const updatedPrefs = await response.json();
      setPreferences(updatedPrefs);

      toast.success('Preferences updated successfully');

      return updatedPrefs;
    } catch (err) {
      // Revert on error
      setPreferences(previousPreferences);

      toast.error('Failed to update preferences');

      throw err;
    }
  };

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences: fetchPreferences,
  };
}
