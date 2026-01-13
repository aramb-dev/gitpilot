'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FilterPreset, FilterConfig } from '@/db/filter-presets';
import { toast } from 'sonner';

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPresets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/filter-presets');
      if (!response.ok) {
        throw new Error('Failed to fetch filter presets');
      }
      const data = await response.json();
      setPresets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error fetching presets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const savePreset = async (name: string, filters: FilterConfig, isDefault = false) => {
    try {
      const response = await fetch('/api/filter-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, filters, isDefault }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preset');
      }

      const newPreset = await response.json();
      setPresets((prev) => [...prev, newPreset]);
      toast.success(`Preset "${name}" saved`);
      return newPreset;
    } catch (err) {
      toast.error('Failed to save preset');
      throw err;
    }
  };

  const deletePreset = async (id: string) => {
    try {
      const response = await fetch('/api/filter-presets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete preset');
      }

      setPresets((prev) => prev.filter((p) => p.id !== id));
      toast.success('Preset deleted');
    } catch (err) {
      toast.error('Failed to delete preset');
      throw err;
    }
  };

  const updatePreset = async (id: string, updates: Partial<Pick<FilterPreset, 'name' | 'filters' | 'isDefault'>>) => {
    try {
      const response = await fetch('/api/filter-presets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preset');
      }

      const updatedPreset = await response.json();
      setPresets((prev) => prev.map((p) => (p.id === id ? updatedPreset : p)));
      toast.success('Preset updated');
      return updatedPreset;
    } catch (err) {
      toast.error('Failed to update preset');
      throw err;
    }
  };

  return {
    presets,
    isLoading,
    error,
    savePreset,
    deletePreset,
    updatePreset,
    refreshPresets: fetchPresets,
  };
}
