'use client';

import { useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  X,
  ExternalLink,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Tag,
  Milestone,
  GitPullRequest,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Issue } from '@/types/issue';

interface IssuePreviewProps {
  issue: Issue | null;
  onClose: () => void;
}

export function IssuePreview({ issue, onClose }: IssuePreviewProps) {
  // Close on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when preview is open
  useEffect(() => {
    if (issue) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [issue]);

  if (!issue) return null;

  const createdAt = new Date(issue.createdAt);
  const updatedAt = new Date(issue.updatedAt);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0d1117] border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                issue.state === 'open' ? 'text-green-500' : 'text-purple-500'
              }`}
            >
              <GitPullRequest className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-400">
              {issue.repository.fullName}#{issue.number}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                issue.state === 'open'
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-purple-900/30 text-purple-400'
              }`}
            >
              {issue.state}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={issue.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="View on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            {/* Title */}
            <h2 className="text-xl font-semibold text-white mb-4">
              {issue.title}
            </h2>

            {/* Labels */}
            {issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {issue.labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-2.5 py-1 text-xs font-medium rounded-full"
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

            {/* Body */}
            <div className="prose prose-invert prose-sm max-w-none mb-6">
              {issue.body ? (
                <div className="whitespace-pre-wrap text-gray-300">
                  {issue.body}
                </div>
              ) : (
                <p className="text-gray-500 italic">No description provided.</p>
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-4 border-t border-gray-800 pt-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">Opened by</span>
                <a
                  href={issue.user.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white hover:text-blue-400"
                >
                  <img
                    src={issue.user.avatarUrl}
                    alt={issue.user.login}
                    className="w-5 h-5 rounded-full"
                  />
                  {issue.user.login}
                </a>
              </div>

              {/* Assignees */}
              {issue.assignees.length > 0 && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-sm text-gray-400">Assignees</span>
                  <div className="flex flex-wrap gap-2">
                    {issue.assignees.map((assignee) => (
                      <a
                        key={assignee.id}
                        href={assignee.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-white hover:text-blue-400"
                      >
                        <img
                          src={assignee.avatarUrl}
                          alt={assignee.login}
                          className="w-5 h-5 rounded-full"
                        />
                        {assignee.login}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestone */}
              {issue.milestone && (
                <div className="flex items-center gap-3">
                  <Milestone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Milestone</span>
                  <span className="text-sm text-white">{issue.milestone.title}</span>
                </div>
              )}

              {/* Comments */}
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">Comments</span>
                <span className="text-sm text-white">{issue.comments}</span>
              </div>

              {/* Created */}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">Created</span>
                <span className="text-sm text-white" title={format(createdAt, 'PPpp')}>
                  {formatDistanceToNow(createdAt, { addSuffix: true })}
                </span>
              </div>

              {/* Updated */}
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">Updated</span>
                <span className="text-sm text-white" title={format(updatedAt, 'PPpp')}>
                  {formatDistanceToNow(updatedAt, { addSuffix: true })}
                </span>
              </div>

              {/* Closed */}
              {issue.closedAt && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Closed</span>
                  <span className="text-sm text-white" title={format(new Date(issue.closedAt), 'PPpp')}>
                    {formatDistanceToNow(new Date(issue.closedAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(issue.htmlUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on GitHub
          </Button>
        </div>
      </div>
    </>
  );
}
