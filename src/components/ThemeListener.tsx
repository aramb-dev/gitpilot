'use client';

import { useEffect } from 'react';
import { usePreferences } from '@/hooks/usePreferences';

export function ThemeListener() {
  const { preferences } = usePreferences();

  useEffect(() => {
    if (preferences?.theme) {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(preferences.theme);
    }
  }, [preferences?.theme]);

  return null;
}
