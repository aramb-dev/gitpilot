import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, AlertCircle, ExternalLink } from "lucide-react"
import { Repository } from '@/types/dashboard'

interface RepositoryCardProps {
    repository: Repository
    isSelected: boolean
    onSelectionChange: (repoId: number, checked: boolean) => void
}

export function RepositoryCard({ repository, isSelected, onSelectionChange }: RepositoryCardProps) {
    return (
        <div data-testid={`repository-card-${repository.id}`} className={`
            bg-[#0d0d0d] border transition-all duration-200 rounded-lg p-5 font-mono
            ${isSelected 
                ? 'border-[#00ff00] bg-[#00ff00]/5 shadow-lg shadow-[#00ff00]/20' 
                : 'border-[#333] hover:border-[#00ff00]/50 hover:bg-[#1a1a1a]/50'
            }
        `}>
            {/* Header with checkbox and repo name */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked: boolean) => onSelectionChange(repository.id, checked)}
                        className="bg-[#1a1a1a] border-[#333] accent-[#00ff00] mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                        <a
                            href={repository.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-white hover:text-[#00ff00] transition-colors flex items-center gap-1.5 break-words"
                        >
                            {repository.name}
                            <ExternalLink className="w-3.5 h-3.5 text-[#666] opacity-50 flex-shrink-0" />
                        </a>
                        <div className="text-xs text-[#666] mt-0.5">{repository.full_name}</div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {repository.description && (
                <div className="text-xs text-[#888] mb-3 line-clamp-2">
                    {repository.description}
                </div>
            )}

            {/* Metadata tags */}
            <div className="flex flex-wrap gap-2 mb-3">
                <Badge
                    variant={repository.visibility === 'public' ? 'outline' : 'secondary'}
                    className={repository.visibility === 'public'
                        ? 'border-[#00ff00]/30 text-[#00ff00] bg-[#00ff00]/5 text-xs'
                        : 'bg-[#888]/20 text-[#888] border-[#888]/30 text-xs'
                    }
                >
                    {repository.visibility === 'public' ? 'public' : 'private'}
                </Badge>
                
                {repository.language && (
                    <Badge
                        variant="outline"
                        className="border-[#666]/30 text-[#888] bg-[#1a1a1a] text-xs"
                    >
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
                <span className="text-right">pushed: {repository.pushed_at ? new Date(repository.pushed_at).toLocaleDateString() : 'never'}</span>
            </div>
        </div>
    )
}
