'use client';

import { ChevronDown } from 'lucide-react';

interface IssueListHeaderProps {
  totalCount: number;
  selectedCount: number;
  allSelected: boolean;
  onSelectAll: (selected: boolean) => void;
  sortBy: 'created' | 'updated' | 'comments';
  sortDirection: 'asc' | 'desc';
  onSortChange: (sort: 'created' | 'updated' | 'comments') => void;
  onDirectionChange: (direction: 'asc' | 'desc') => void;
}

export function IssueListHeader({
  totalCount,
  selectedCount,
  allSelected,
  onSelectAll,
  sortBy,
  sortDirection,
  onSortChange,
  onDirectionChange,
}: IssueListHeaderProps) {
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={allSelected && totalCount > 0}
          onChange={handleSelectAllChange}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
        />
        <span className="text-sm text-gray-400">
          {selectedCount > 0 ? (
            <span className="text-white">{selectedCount} selected</span>
          ) : (
            <span>{totalCount.toLocaleString()} issues</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as 'created' | 'updated' | 'comments')
            }
            className="appearance-none bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 pr-8 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created">Newest</option>
            <option value="updated">Recently updated</option>
            <option value="comments">Most commented</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        <button
          onClick={() =>
            onDirectionChange(sortDirection === 'desc' ? 'asc' : 'desc')
          }
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title={sortDirection === 'desc' ? 'Descending' : 'Ascending'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              sortDirection === 'asc' ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
