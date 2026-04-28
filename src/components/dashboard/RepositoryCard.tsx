import { AlertCircle, ExternalLink, GitFork, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Repository } from '@/types/dashboard';

interface RepositoryCardProps {
  repository: Repository;
  isSelected: boolean;
  onSelectionChange: (repoId: number, checked: boolean) => void;
}

export function RepositoryCard({ repository, isSelected, onSelectionChange }: RepositoryCardProps) {
  return (
    <div
      data-testid={`repository-card-${repository.id}`}
      className={`
            bg-[#0d0d0d] border transition-all duration-300 rounded-lg p-5 font-mono relative overflow-hidden group
            ${
              isSelected
                ? 'border-[#00ff00] bg-[#00ff00]/5 shadow-[0_0_15px_rgba(0,255,0,0.15)]'
                : 'border-[#333] hover:border-[#00ff00]/40 hover:bg-[#00ff00]/[0.02] hover:shadow-[0_0_10px_rgba(0,255,0,0.05)]'
            }
        `}
    >
      {/* Selection Glow corner */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-12 h-12 bg-[#00ff00]/10 blur-xl pointer-events-none" />
      )}

      {/* Header with checkbox and repo name */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked: boolean) => onSelectionChange(repository.id, checked)}
            className="bg-[#1a1a1a] border-[#333] data-[state=checked]:bg-[#00ff00] data-[state=checked]:text-black mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white group-hover:text-[#00ff00] transition-colors flex items-center gap-1.5 break-words text-sm"
            >
              <span className="text-[#00ff00] opacity-0 group-hover:opacity-100 transition-opacity">
                &gt;
              </span>
              {repository.name}
              <ExternalLink className="w-3 h-3 text-[#666] opacity-50 flex-shrink-0 group-hover:text-[#00ff00]" />
            </a>
            <div className="text-[10px] text-[#555] mt-0.5 uppercase tracking-wider">
              ID: {repository.id} // {repository.full_name}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {repository.description && (
        <div className="text-xs text-[#888] mb-3 line-clamp-2">{repository.description}</div>
      )}

      {/* Metadata tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge
          variant={repository.visibility === 'public' ? 'outline' : 'secondary'}
          className={
            repository.visibility === 'public'
              ? 'border-[#00ff00]/30 text-[#00ff00] bg-[#00ff00]/5 text-xs'
              : 'bg-[#888]/20 text-[#888] border-[#888]/30 text-xs'
          }
        >
          {repository.visibility === 'public' ? 'public' : 'private'}
        </Badge>

        {repository.language && (
          <Badge variant="outline" className="border-[#666]/30 text-[#888] bg-[#1a1a1a] text-xs">
            {repository.language}
          </Badge>
        )}

        {repository.archived && (
          <Badge
            variant="secondary"
            className="bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]/30 text-xs"
          >
            archived
          </Badge>
        )}

        {repository.disabled && (
          <Badge
            variant="secondary"
            className="bg-[#ff8c42]/20 text-[#ff8c42] border-[#ff8c42]/30 text-xs flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            disabled
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-[#666] mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-[#00ff00]/60" />
          <span>{repository.stars}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5 text-[#00ff00]/60" />
          <span>{repository.forks}</span>
        </div>
        <div className="text-xs">
          {repository.open_issues > 0 && (
            <span className="text-[#ff8c42]">{repository.open_issues} issues</span>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs text-[#666] border-t border-[#333] pt-2">
        <span>updated: {new Date(repository.updated_at).toLocaleDateString()}</span>
        <span className="text-right">
          pushed:{' '}
          {repository.pushed_at ? new Date(repository.pushed_at).toLocaleDateString() : 'never'}
        </span>
      </div>
    </div>
  );
}
