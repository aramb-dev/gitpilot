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
    <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-[#333] font-mono">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={allSelected && totalCount > 0}
          onChange={handleSelectAllChange}
          className="w-4 h-4 rounded-none border-[#333] bg-[#0d0d0d] text-[#00ff00] focus:ring-[#00ff00] accent-[#00ff00]"
        />
        <span className="text-sm text-[#666]">
          {selectedCount > 0 ? (
            <span className="text-[#00ff00] font-bold">[{selectedCount} SELECTED]</span>
          ) : (
            <span>// {totalCount.toLocaleString()} ISSUES</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'created' | 'updated' | 'comments')}
            className="appearance-none bg-[#0d0d0d] border border-[#333] px-3 py-1.5 pr-8 text-xs text-[#888] focus:outline-none focus:ring-1 focus:ring-[#00ff00] font-mono"
          >
            <option value="created">NEWEST</option>
            <option value="updated">RECENTLY_UPDATED</option>
            <option value="comments">MOST_COMMENTED</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
        </div>

        <button
          onClick={() => onDirectionChange(sortDirection === 'desc' ? 'asc' : 'desc')}
          className="p-1.5 text-[#666] hover:text-[#00ff00] hover:bg-[#1a1a1a] border border-transparent hover:border-[#333] transition-all"
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
