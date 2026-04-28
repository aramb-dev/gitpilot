'use client';

import { CheckCircle2, GitMerge, GitPullRequest, Search, X } from 'lucide-react';
import { useState } from 'react';
import type { IssueLabel, IssueUser } from '@/types/issue';
import type { PRFilters as PRFiltersType } from '@/types/pull-request';
import { FilterPresetsManager } from '../FilterPresetsManager';
import { AssigneeFilter } from '../issues/filters/AssigneeFilter';
import { LabelFilter } from '../issues/filters/LabelFilter';
import { RepoFilter } from '../issues/filters/RepoFilter';
import { StateFilter } from '../issues/filters/StateFilter';

interface PRFiltersProps {
  filters: PRFiltersType;
  onFiltersChange: (filters: PRFiltersType) => void;
  availableRepos: string[];
  availableLabels: IssueLabel[];
  availableAssignees: IssueUser[];
  isLoadingLabels?: boolean;
  isLoadingAssignees?: boolean;
}

export function PRFilters({
  filters,
  onFiltersChange,
  availableRepos,
  availableLabels,
  availableAssignees,
  isLoadingLabels = false,
  isLoadingAssignees = false,
}: PRFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const updateFilter = <K extends keyof PRFiltersType>(key: K, value: PRFiltersType[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const applyPreset = (presetFilters: any) => {
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
      repos: filters.repos,
      labels: undefined,
      assignee: undefined,
      search: undefined,
      draft: undefined,
    });
  };

  const activeFilterCount = [
    filters.state !== 'open' ? 1 : 0,
    filters.labels?.length || 0,
    filters.assignee ? 1 : 0,
    filters.search ? 1 : 0,
    filters.draft !== undefined ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4 font-mono">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
        <input
          type="text"
          placeholder="search_pull_requests..."
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
          onChange={(state) => updateFilter('state', state as any)}
          options={[
            { value: 'open', label: 'open', icon: GitPullRequest, color: 'text-[#00ff00]' },
            { value: 'closed', label: 'closed', icon: CheckCircle2, color: 'text-red-500' },
            { value: 'merged', label: 'merged', icon: GitMerge, color: 'text-purple-500' },
          ]}
        />

        <RepoFilter
          availableRepos={availableRepos}
          selectedRepos={filters.repos || []}
          onChange={(repos) => updateFilter('repos', repos)}
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

        {/* Draft Filter */}
        <select
          value={filters.draft === true ? 'draft' : filters.draft === false ? 'ready' : 'all'}
          onChange={(e) => {
            const val = e.target.value;
            updateFilter('draft', val === 'draft' ? true : val === 'ready' ? false : undefined);
          }}
          className="h-9 px-3 bg-[#1a1a1a] border border-[#333] text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#00ff00]"
        >
          <option value="all">all_types</option>
          <option value="draft">drafts_only</option>
          <option value="ready">ready_to_merge</option>
        </select>

        <div className="flex items-center gap-2 border-l border-[#333] pl-3">
          <FilterPresetsManager
            context="pull_requests"
            currentFilters={filters}
            onApplyPreset={applyPreset}
          />
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
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
