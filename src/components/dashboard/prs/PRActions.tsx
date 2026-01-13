import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GitMerge, X, RotateCcw, Settings, Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { PullRequest } from '@/types/pull-request';

interface PRActionsProps {
  hasSelectedPRs: boolean;
  selectedPRs: PullRequest[];
  stateFilter: string;
  onStateChange: (state: string) => void;
  draftFilter: string;
  onDraftChange: (draft: string) => void;
  onSearch: (query: string) => void;
  onMerge: () => void;
  onClose: () => void;
  onReopen: () => void;
  isLoading: boolean;
}

export function PRActions({
  hasSelectedPRs,
  selectedPRs,
  stateFilter,
  onStateChange,
  draftFilter,
  onDraftChange,
  onSearch,
  onMerge,
  onClose,
  onReopen,
  isLoading,
}: PRActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const mergeableCount = selectedPRs.filter(pr => !pr.merged && pr.state === 'open').length;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
            <Input
              type="text"
              placeholder="search pull requests..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9 bg-[#1a1a1a] border-[#333] text-white placeholder-[#666] font-mono text-sm"
            />
          </div>
        </div>

        {/* State and Draft Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative inline-block">
            <button
              onClick={() => {
                const newState = stateFilter === 'all' ? 'open' : stateFilter === 'open' ? 'closed' : 'all';
                onStateChange(newState);
              }}
              className="px-3 py-1.5 text-xs font-mono bg-[#1a1a1a] border border-[#333] text-white hover:border-[#00ff00] transition-colors flex items-center gap-2 rounded"
            >
              {stateFilter === 'all' ? 'all_states' : stateFilter}
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="relative inline-block">
            <button
              onClick={() => {
                const newDraft = draftFilter === 'all' ? 'draft' : draftFilter === 'draft' ? 'ready' : 'all';
                onDraftChange(newDraft);
              }}
              className="px-3 py-1.5 text-xs font-mono bg-[#1a1a1a] border border-[#333] text-white hover:border-[#00ff00] transition-colors flex items-center gap-2 rounded"
            >
              {draftFilter === 'all' ? 'all_types' : draftFilter}
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasSelectedPRs && (
        <div className="border border-[#333] rounded-lg p-4 bg-[#0d0d0d]/50 space-y-3">
          <div className="text-xs text-[#666] font-mono">
            {selectedPRs.length} pull request{selectedPRs.length !== 1 ? 's' : ''} selected
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onMerge}
              disabled={!hasSelectedPRs || mergeableCount === 0 || isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs h-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitMerge className="w-3 h-3 mr-1" />
              merge ({mergeableCount})
            </Button>

            <Button
              onClick={onReopen}
              disabled={!hasSelectedPRs || isLoading}
              variant="outline"
              className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00] font-mono text-xs h-8"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              reopen
            </Button>

            <Button
              onClick={onClose}
              disabled={!hasSelectedPRs || isLoading}
              variant="outline"
              className="border-[#333] hover:border-red-500 text-[#888] hover:text-red-400 font-mono text-xs h-8"
            >
              <X className="w-3 h-3 mr-1" />
              close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
