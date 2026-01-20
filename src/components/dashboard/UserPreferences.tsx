'use client';

import { usePreferences } from '@/hooks/usePreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function UserPreferences() {
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const [formData, setFormData] = useState({
    defaultBranch: 'main',
    defaultVisibility: 'all',
    itemsPerPage: 30,
    theme: 'dark',
    showArchived: false,
    showForks: true,
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        defaultBranch: preferences.defaultBranch,
        defaultVisibility: preferences.defaultVisibility,
        itemsPerPage: preferences.itemsPerPage,
        theme: preferences.theme || 'dark',
        showArchived: preferences.showArchived,
        showForks: preferences.showForks,
      });
    }
  }, [preferences]);

  const handleToggle = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences(formData as any);
  };

  if (isLoading && !preferences) {
    return <div className="text-sm text-[#666]">loading_preferences...</div>;
  }

  return (
    <Card className="bg-[#0d0d0d] border-[#333]">
      <CardHeader className="border-b border-[#333]">
        <CardTitle className="text-lg font-mono text-white">[user_preferences]</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-[#888] uppercase tracking-wider">Default Branch</label>
              <Input
                name="defaultBranch"
                value={formData.defaultBranch}
                onChange={handleInputChange}
                className="bg-[#111] border-[#333] text-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#888] uppercase tracking-wider">Items Per Page</label>
              <Input
                type="number"
                name="itemsPerPage"
                value={formData.itemsPerPage}
                onChange={handleInputChange}
                className="bg-[#111] border-[#333] text-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#888] uppercase tracking-wider">Default Visibility</label>
              <select
                name="defaultVisibility"
                value={formData.defaultVisibility}
                onChange={handleSelectChange}
                className="w-full h-10 px-3 bg-[#111] border border-[#333] text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#00ff00]"
              >
                <option value="all">all</option>
                <option value="public">public</option>
                <option value="private">private</option>
                <option value="forks">forks</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#888] uppercase tracking-wider">Theme</label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleSelectChange}
                className="w-full h-10 px-3 bg-[#111] border border-[#333] text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#00ff00]"
              >
                <option value="dark">dark_terminal</option>
                <option value="light">light_lab</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="showArchived"
                checked={formData.showArchived}
                onCheckedChange={() => handleToggle('showArchived')}
              />
              <label
                htmlFor="showArchived"
                className="text-sm text-[#ccc] font-mono cursor-pointer"
              >
                Show archived repositories by default
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="showForks"
                checked={formData.showForks}
                onCheckedChange={() => handleToggle('showForks')}
              />
              <label
                htmlFor="showForks"
                className="text-sm text-[#ccc] font-mono cursor-pointer"
              >
                Show forked repositories by default
              </label>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="bg-[#00ff00] hover:bg-[#00cc00] text-black font-bold font-mono px-8"
            >
              SAVE_CHANGES
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
