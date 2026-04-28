'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Clock,
  ExternalLink,
  GitCommit,
  GitPullRequest,
  MessageSquare,
  Minus,
  Plus,
  User,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PullRequest } from '@/types/pull-request';

interface PRPreviewProps {
  pr: PullRequest | null;
  onClose: () => void;
}

export function PRPreview({ pr, onClose }: PRPreviewProps) {
  if (!pr) return null;

  const stateColor = pr.merged
    ? 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    : pr.state === 'open'
      ? 'text-[#00ff00] bg-[#00ff00]/10 border-[#00ff00]/20'
      : 'text-red-500 bg-red-500/10 border-red-500/20';

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-[#0d0d0d] border-l border-[#333] shadow-2xl z-50 transform transition-transform duration-300 flex flex-col font-mono">
      {/* Header */}
      <div className="p-6 border-b border-[#333] flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={`px-2 py-0.5 rounded-none border ${stateColor} font-mono text-[10px]`}
            >
              {pr.merged ? 'merged' : pr.state}
            </Badge>
            <span className="text-xs text-[#666]">
              {pr.repository.fullName}#{pr.number}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white leading-tight">{pr.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#1a1a1a] text-[#666] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#1a1a1a] border border-[#333]">
            <div className="text-[10px] text-[#666] uppercase tracking-widest mb-1">Author</div>
            <div className="flex items-center gap-2">
              <img src={pr.user.avatarUrl} className="w-4 h-4 rounded-full" />
              <span className="text-sm text-white">{pr.user.login}</span>
            </div>
          </div>
          <div className="p-3 bg-[#1a1a1a] border border-[#333]">
            <div className="text-[10px] text-[#666] uppercase tracking-widest mb-1">Updated</div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-[#666]" />
              <span className="text-sm text-white">
                {formatDistanceToNow(new Date(pr.updatedAt))} ago
              </span>
            </div>
          </div>
        </div>

        {/* Diff Stats */}
        <div className="flex items-center gap-6 p-4 bg-[#00ff00]/5 border border-[#00ff00]/10">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-[#666]" />
            <span className="text-sm text-white font-bold">{pr.commits}</span>
            <span className="text-[10px] text-[#666]">commits</span>
          </div>
          <div className="flex items-center gap-1">
            <Plus className="w-3 h-3 text-[#00ff00]" />
            <span className="text-sm text-[#00ff00] font-bold">{pr.additions}</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="w-3 h-3 text-red-500" />
            <span className="text-sm text-red-500 font-bold">{pr.deletions}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <MessageSquare className="w-4 h-4 text-[#666]" />
            <span className="text-sm text-white font-bold">{pr.comments + pr.reviewComments}</span>
          </div>
        </div>

        {/* Labels */}
        {pr.labels.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs text-[#666] uppercase tracking-widest font-bold">// labels</h3>
            <div className="flex flex-wrap gap-2">
              {pr.labels.map((label) => (
                <span
                  key={label.id}
                  className="px-2 py-0.5 text-[10px] border font-mono"
                  style={{
                    backgroundColor: `#${label.color}20`,
                    borderColor: `#${label.color}40`,
                    color: `#${label.color}`,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviewers */}
        {pr.reviewers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs text-[#666] uppercase tracking-widest font-bold">
              // reviewers
            </h3>
            <div className="space-y-2">
              {pr.reviewers.map((reviewer) => (
                <div
                  key={reviewer.id}
                  className="flex items-center justify-between p-2 bg-[#1a1a1a] border border-[#333]"
                >
                  <div className="flex items-center gap-2">
                    <img src={reviewer.avatarUrl} className="w-5 h-5 rounded-full" />
                    <span className="text-xs text-white">{reviewer.login}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono border-[#333] text-[#666]"
                  >
                    {reviewer.state.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {pr.body && (
          <div className="space-y-3">
            <h3 className="text-xs text-[#666] uppercase tracking-widest font-bold">
              // description
            </h3>
            <div className="text-sm text-[#888] leading-relaxed line-clamp-[10] bg-[#0d0d0d] p-4 border border-[#333] whitespace-pre-wrap">
              {pr.body}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[#333] bg-[#0d0d0d] space-y-3">
        <a
          href={pr.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1a1a1a] border border-[#333] text-white hover:text-[#00ff00] hover:border-[#00ff00] transition-all text-sm font-bold"
        >
          VIEW_ON_GITHUB
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
