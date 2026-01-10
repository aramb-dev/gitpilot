'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { StateFilter } from './filters/StateFilter';
import { RepoFilter } from './filters/RepoFilter';
import { LabelFilter } from './filters/LabelFilter';
import { AssigneeFilter } from './filters/AssigneeFilter';
import type { IssueFilters as IssueFiltersType, IssueLabel, IssueUser } from '@/types/issue';

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

  const updateFilter = <K extends keyof IssueFiltersType>(
    key: K,
    value: IssueFiltersType[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
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
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search issues..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
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

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Clear filters
            <span className="ml-1 px-1.5 py-0.5 bg-gray-700 rounded text-xs">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
