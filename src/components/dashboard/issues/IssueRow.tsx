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
      className={`flex items-start gap-3 p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-900/20' : ''
      }`}
      onClick={handleRowClick}
    >
      {/* Checkbox */}
      <div className="pt-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
        />
      </div>

      {/* Issue Icon */}
      <div className="pt-0.5">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${
            issue.state === 'open'
              ? 'text-green-500'
              : 'text-purple-500'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="text-white font-medium hover:text-blue-400 truncate">
            {issue.title}
          </h3>
        </div>

        {/* Labels */}
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {issue.labels.map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}40`,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="text-gray-400">
            {issue.repository.fullName}#{issue.number}
          </span>
          <span>opened {timeAgo}</span>
          <span>by {issue.user.login}</span>
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
        <div className="flex -space-x-2">
          {issue.assignees.slice(0, 3).map((assignee) => (
            <img
              key={assignee.id}
              src={assignee.avatarUrl}
              alt={assignee.login}
              title={assignee.login}
              className="w-6 h-6 rounded-full border-2 border-gray-900"
            />
          ))}
          {issue.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-xs text-gray-400">
              +{issue.assignees.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
