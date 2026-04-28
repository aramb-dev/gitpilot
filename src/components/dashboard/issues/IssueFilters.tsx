'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import type { IssueFilters as IssueFiltersType, IssueLabel, IssueUser } from '@/types/issue';
import { FilterPresetsManager } from '../FilterPresetsManager';
import { AssigneeFilter } from './filters/AssigneeFilter';
import { LabelFilter } from './filters/LabelFilter';
import { RepoFilter } from './filters/RepoFilter';
import { StateFilter } from './filters/StateFilter';
import { UserFilter } from './filters/UserFilter';

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

  const updateFilter = <K extends keyof IssueFiltersType>(key: K, value: IssueFiltersType[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const applyPreset = (presetFilters: any) => {
    // Merge preset filters with current repos if preset doesn't have repos
    const newFilters = { ...filters, ...presetFilters };
    if (!presetFilters.repos && filters.repos) {
      newFilters.repos = filters.repos;
    }
    onFiltersChange(newFilters);
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
      labels: undefined,
      assignee: undefined,
      creator: undefined,
      mentioned: undefined,
      search: undefined,
    });
  };

  const activeFilterCount = [
    filters.state !== 'open' ? 1 : 0,
    filters.labels?.length || 0,
    filters.assignee ? 1 : 0,
    filters.creator ? 1 : 0,
    filters.mentioned ? 1 : 0,
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

        <UserFilter
          label="AUTHOR"
          availableUsers={availableAssignees}
          selectedUser={filters.creator || null}
          onChange={(creator) => updateFilter('creator', creator || undefined)}
          isLoading={isLoadingAssignees}
          placeholder="filter_authors..."
          anyLabel="ANY_AUTHOR"
        />

        <UserFilter
          label="MENTIONED"
          availableUsers={availableAssignees}
          selectedUser={filters.mentioned || null}
          onChange={(mentioned) => updateFilter('mentioned', mentioned || undefined)}
          isLoading={isLoadingAssignees}
          placeholder="filter_mentions..."
          anyLabel="ANY_MENTION"
        />

        <div className="flex items-center gap-2 border-l border-[#333] pl-3">
          <FilterPresetsManager
            context="issues"
            currentFilters={filters}
            onApplyPreset={applyPreset}
          />
        </div>

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
