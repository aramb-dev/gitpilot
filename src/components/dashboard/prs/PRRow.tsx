import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, GitPullRequest, GitMerge } from 'lucide-react';
import type { PullRequest } from '@/types/pull-request';

interface PRRowProps {
  pr: PullRequest;
  isSelected: boolean;
  onSelect: (pr: PullRequest, selected: boolean) => void;
  onClick: (pr: PullRequest) => void;
}

export function PRRow({ pr, isSelected, onSelect, onClick }: PRRowProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(pr, e.target.checked);
  };

  const handleRowClick = () => {
    onClick(pr);
  };

  const timeAgo = formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true });

  const getStateColor = () => {
    if (pr.merged) return 'text-purple-400';
    if (pr.state === 'open') return 'text-[#00ff00]';
    return 'text-red-400';
  };

  const getStateLabel = () => {
    if (pr.merged) return 'merged';
    return pr.state;
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 border-b border-[#333] hover:bg-[#1a1a1a] cursor-pointer transition-colors font-mono ${
        isSelected ? 'bg-[#00ff00]/5 border-l-2 border-[#00ff00]' : 'border-l-2 border-transparent'
      }`}
      onClick={handleRowClick}
    >
      {/* Checkbox */}
      <div className="pt-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="w-4 h-4 rounded-none border-[#333] bg-[#0d0d0d] text-[#00ff00] focus:ring-[#00ff00] accent-[#00ff00]"
        />
      </div>

      {/* PR Icon */}
      <div className="pt-0.5">
        <div
          className={`w-5 h-5 border flex items-center justify-center ${
            pr.merged
              ? 'border-purple-400 text-purple-400'
              : pr.state === 'open'
              ? 'border-[#00ff00] text-[#00ff00]'
              : 'border-red-400 text-red-400'
          }`}
        >
          {pr.merged ? <GitMerge className="w-4 h-4" /> : <GitPullRequest className="w-4 h-4" />}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="text-white font-medium hover:text-[#00ff00] truncate">
            {pr.title}
          </h3>
          {pr.draft && (
            <span className="px-2 py-0.5 text-[10px] font-mono border border-[#666]/30 bg-[#666]/10 text-[#888] whitespace-nowrap">
              [DRAFT]
            </span>
          )}
        </div>

        {/* Labels */}
        {pr.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {pr.labels.map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 text-[10px] font-mono border"
                style={{
                  backgroundColor: `#${label.color}10`,
                  color: `#${label.color}`,
                  borderColor: `#${label.color}30`,
                }}
              >
                [{label.name.toUpperCase()}]
              </span>
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-[#666]">
          <span className="text-[#888]">
            {pr.repository.fullName}#{pr.number}
          </span>
          <span>&gt; {getStateLabel().toUpperCase()}</span>
          <span>&gt; {timeAgo}</span>
          <span>&gt; by {pr.user.login}</span>
          {(pr.comments > 0 || pr.reviewComments > 0) && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {pr.comments + pr.reviewComments}
            </span>
          )}
        </div>
      </div>

      {/* Reviewers */}
      {pr.reviewers && pr.reviewers.length > 0 && (
        <div className="flex items-center gap-1">
          {pr.reviewers.slice(0, 2).map((reviewer) => (
            <div
              key={reviewer.id}
              className="w-6 h-6 rounded-full border border-[#333] bg-[#1a1a1a] flex items-center justify-center text-[10px] text-[#666]"
              title={reviewer.login}
            >
              {reviewer.login.charAt(0).toUpperCase()}
            </div>
          ))}
          {pr.reviewers.length > 2 && (
            <div className="w-6 h-6 rounded-full border border-[#333] bg-[#1a1a1a] flex items-center justify-center text-[10px] text-[#666]">
              +{pr.reviewers.length - 2}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
