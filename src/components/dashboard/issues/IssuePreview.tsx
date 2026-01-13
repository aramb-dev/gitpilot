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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0a0a0a] border-l border-[#333] z-50 flex flex-col shadow-2xl font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#0d0d0d]">
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 border border-[#333] flex items-center justify-center ${
                issue.state === 'open' ? 'text-[#00ff00]' : 'text-purple-500'
              }`}
            >
              <GitPullRequest className="w-5 h-5" />
            </div>
            <span className="text-xs text-[#666]">
              {issue.repository.fullName}#{issue.number}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold border ${
                issue.state === 'open'
                  ? 'bg-[#00ff00]/5 text-[#00ff00] border-[#00ff00]/30'
                  : 'bg-purple-900/10 text-purple-400 border-purple-900/30'
              }`}
            >
              [{issue.state.toUpperCase()}]
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={issue.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#666] hover:text-[#00ff00] hover:bg-[#1a1a1a] border border-transparent hover:border-[#333] transition-all"
              title="View on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-[#666] hover:text-red-500 hover:bg-[#1a1a1a] border border-transparent hover:border-[#333] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-6 leading-tight uppercase tracking-tight">
              &gt; {issue.title}
            </h2>

            {/* Labels */}
            {issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {issue.labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-2.5 py-1 text-[10px] font-mono border"
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

            {/* Body */}
            <div className="prose prose-invert prose-sm max-w-none mb-8 bg-[#0d0d0d] p-4 border border-[#333]">
              {issue.body ? (
                <div className="whitespace-pre-wrap text-[#888] font-mono leading-relaxed text-xs">
                  {issue.body}
                </div>
              ) : (
                <p className="text-[#444] italic font-mono text-xs">no_description_provided</p>
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-4 border-t border-[#333] pt-6">
              {/* Author */}
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#444]" />
                <span className="text-xs text-[#666] w-24">[AUTHOR]</span>
                <a
                  href={issue.user.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#888] hover:text-[#00ff00] transition-colors"
                >
                  <img
                    src={issue.user.avatarUrl}
                    alt={issue.user.login}
                    className="w-5 h-5 border border-[#333]"
                  />
                  {issue.user.login}
                </a>
              </div>

              {/* Assignees */}
              {issue.assignees.length > 0 && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-[#444] mt-0.5" />
                  <span className="text-xs text-[#666] w-24">[ASSIGNEES]</span>
                  <div className="flex flex-wrap gap-3">
                    {issue.assignees.map((assignee) => (
                      <a
                        key={assignee.id}
                        href={assignee.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#00ff00] transition-colors"
                      >
                        <img
                          src={assignee.avatarUrl}
                          alt={assignee.login}
                          className="w-5 h-5 border border-[#333]"
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
                  <Milestone className="w-4 h-4 text-[#444]" />
                  <span className="text-xs text-[#666] w-24">[MILESTONE]</span>
                  <span className="text-xs text-[#888]">{issue.milestone.title}</span>
                </div>
              )}

              {/* Comments */}
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-[#444]" />
                <span className="text-xs text-[#666] w-24">[COMMENTS]</span>
                <span className="text-xs text-[#888]">{issue.comments}</span>
              </div>

              {/* Created */}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#444]" />
                <span className="text-xs text-[#666] w-24">[CREATED]</span>
                <span className="text-xs text-[#888]" title={format(createdAt, 'PPpp')}>
                  {formatDistanceToNow(createdAt, { addSuffix: true })}
                </span>
              </div>

              {/* Updated */}
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#444]" />
                <span className="text-xs text-[#666] w-24">[UPDATED]</span>
                <span className="text-xs text-[#888]" title={format(updatedAt, 'PPpp')}>
                  {formatDistanceToNow(updatedAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-[#333] bg-[#0d0d0d]">
          <Button
            variant="outline"
            className="w-full bg-[#1a1a1a] text-[#00ff00] border border-[#333] hover:border-[#00ff00] font-bold h-12"
            onClick={() => window.open(issue.htmlUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            VIEW_ON_GITHUB
          </Button>
        </div>
      </div>
    </>
  );
}
