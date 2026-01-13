'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, GitPullRequest } from 'lucide-react';
import type { Issue } from '@/types/issue';

interface IssueRowProps {
  issue: Issue;
  isSelected: boolean;
  onSelect: (issue: Issue, selected: boolean) => void;
  onClick: (issue: Issue) => void;
}

export function IssueRow({ issue, isSelected, onSelect, onClick }: IssueRowProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(issue, e.target.checked);
  };

  const handleRowClick = () => {
    onClick(issue);
  };

  const timeAgo = formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true });

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

      {/* Issue Icon */}
      <div className="pt-0.5">
        <div
          className={`w-5 h-5 border border-[#333] flex items-center justify-center ${
            issue.state === 'open'
              ? 'text-[#00ff00]'
              : 'text-purple-500'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="text-white font-medium hover:text-[#00ff00] truncate">
            {issue.title}
          </h3>
        </div>

        {/* Labels */}
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {issue.labels.map((label) => (
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
            {issue.repository.fullName}#{issue.number}
          </span>
          <span>&gt; opened {timeAgo}</span>
          <span>&gt; by {issue.user.login}</span>
          {issue.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {issue.comments}
            </span>
          )}
        </div>
      </div>

      {/* Assignees */}
      {issue.assignees.length > 0 && (
        <div className="flex -space-x-1">
          {issue.assignees.slice(0, 3).map((assignee) => (
            <img
              key={assignee.id}
              src={assignee.avatarUrl}
              alt={assignee.login}
              title={assignee.login}
              className="w-6 h-6 border border-[#333] bg-[#0d0d0d]"
            />
          ))}
          {issue.assignees.length > 3 && (
            <div className="w-6 h-6 border border-[#333] bg-[#1a1a1a] flex items-center justify-center text-[10px] text-[#666]">
              +{issue.assignees.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
