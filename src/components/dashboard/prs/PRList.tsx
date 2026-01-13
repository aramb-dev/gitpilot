import type { PullRequest } from '@/types/pull-request';
import { PRRow } from './PRRow';

interface PRListProps {
  prs: PullRequest[];
  selectedPRs: Set<string>;
  onSelectPR: (pr: PullRequest, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewPR: (pr: PullRequest) => void;
}

export function PRList({
  prs,
  selectedPRs,
  onSelectPR,
  onSelectAll,
  onViewPR,
}: PRListProps) {
  const allSelected = prs.length > 0 && prs.every((pr) => selectedPRs.has(String(pr.id)));

  return (
    <div className="border border-[#333] rounded-none bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#333] bg-[#1a1a1a] font-mono">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="w-4 h-4 rounded-none border-[#333] bg-[#0d0d0d] text-[#00ff00] focus:ring-[#00ff00] accent-[#00ff00]"
        />
        <div className="flex-1 grid grid-cols-12 gap-4 px-2 text-[10px] text-[#666] uppercase">
          <div className="col-span-6">PR</div>
          <div className="col-span-2">Repository</div>
          <div className="col-span-2">State</div>
          <div className="col-span-2">Updated</div>
        </div>
      </div>

      {/* Rows */}
      {prs.length === 0 ? (
        <div className="p-8 text-center text-[#666] font-mono text-sm">
          {'>!'} no_pull_requests_found
        </div>
      ) : (
        prs.map((pr) => (
          <PRRow
            key={pr.id}
            pr={pr}
            isSelected={selectedPRs.has(String(pr.id))}
            onSelect={(pr, checked) => onSelectPR(pr, checked)}
            onClick={onViewPR}
          />
        ))
      )}
    </div>
  );
}
