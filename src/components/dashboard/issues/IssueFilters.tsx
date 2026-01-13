'use client';

import { useState } from 'react';
import { Search, X, Save, Bookmark } from 'lucide-react';
import { StateFilter } from './filters/StateFilter';
import { RepoFilter } from './filters/RepoFilter';
import { LabelFilter } from './filters/LabelFilter';
import { AssigneeFilter } from './filters/AssigneeFilter';
import type { IssueFilters as IssueFiltersType, IssueLabel, IssueUser } from '@/types/issue';
import { useFilterPresets } from '@/hooks/useFilterPresets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface IssueFiltersProps {
  filters: IssueFiltersType;
  onFiltersChange: (filters: IssueFiltersType) => void;
  availableRepos: string[];
  availableLabels: IssueLabel[];
  availableAssignees: IssueUser[];
  isLoadingLabels?: boolean;
  isLoadingAssignees?: boolean;
}

export function IssueFilters({
  filters,
  onFiltersChange,
  availableRepos,
  availableLabels,
  availableAssignees,
  isLoadingLabels = false,
  isLoadingAssignees = false,
}: IssueFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const { presets, savePreset, isLoading: isLoadingPresets } = useFilterPresets();
  const [presetName, setPresetName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const updateFilter = <K extends keyof IssueFiltersType>(
    key: K,
    value: IssueFiltersType[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSavePreset = async () => {
    if (!presetName) return;
    await savePreset(presetName, filters as any);
    setPresetName('');
    setIsSaveDialogOpen(false);
  };

  const applyPreset = (presetFilters: any) => {
    onFiltersChange({ ...filters, ...presetFilters });
    if (presetFilters.search) setSearchValue(presetFilters.search);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchValue || undefined);
  };

  const handleSearchClear = () => {
    setSearchValue('');
    updateFilter('search', undefined);
  };

  const clearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({
      state: 'open',
      repos: filters.repos, // Keep repos selected
    });
  };

  const activeFilterCount = [
    filters.state !== 'open' ? 1 : 0,
    filters.labels?.length || 0,
    filters.assignee ? 1 : 0,
    filters.search ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4 font-mono">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
        <input
          type="text"
          placeholder="search_issues..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-[#1a1a1a] border border-[#333] text-sm text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#00ff00] font-mono"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#00ff00]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-3">
        <StateFilter
          value={filters.state || 'open'}
          onChange={(state) => updateFilter('state', state)}
        />

        <RepoFilter
          availableRepos={availableRepos}
          selectedRepos={filters.repos || []}
          onChange={(repos) => updateFilter('repos', repos.length > 0 ? repos : undefined)}
        />

        <LabelFilter
          availableLabels={availableLabels}
          selectedLabels={filters.labels || []}
          onChange={(labels) => updateFilter('labels', labels.length > 0 ? labels : undefined)}
          isLoading={isLoadingLabels}
        />

        <AssigneeFilter
          availableAssignees={availableAssignees}
          selectedAssignee={filters.assignee || null}
          onChange={(assignee) => updateFilter('assignee', assignee || undefined)}
          isLoading={isLoadingAssignees}
        />

        {/* Preset Selector */}
        {presets.length > 0 && (
          <div className="flex items-center gap-2 border-l border-[#333] pl-3">
            <span className="text-xs text-[#666] font-mono">[presets]:</span>
            <div className="flex gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.filters)}
                  className="px-2 py-1 text-[10px] bg-[#0d0d0d] border border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00] font-mono transition-all"
                >
                  {preset.name.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save Preset Dialog */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 bg-[#1a1a1a] border-[#333] text-[#888] hover:text-[#00ff00] hover:border-[#00ff00] font-mono"
            >
              <Save className="w-4 h-4 mr-2" />
              SAVE_PRESET
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0d0d] border border-[#333] text-white font-mono rounded-none">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">// SAVE_FILTER_PRESET</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs text-[#666] uppercase tracking-widest">Preset Name</label>
                <Input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g. status_bugs"
                  className="bg-[#1a1a1a] border-[#333] text-white font-mono focus:ring-[#00ff00]"
                />
              </div>
              <Button 
                onClick={handleSavePreset}
                disabled={!presetName}
                className="w-full bg-[#00ff00] hover:bg-[#00cc00] text-black font-bold"
              >
                CONFIRM_SAVE
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#666] hover:text-[#00ff00] transition-colors font-mono"
          >
            <X className="w-4 h-4" />
            CLEAR_FILTERS
            <span className="ml-1 px-1.5 py-0.5 bg-[#333] text-white text-[10px]">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
