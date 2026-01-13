import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, MessageSquare, ExternalLink, GitCompare } from "lucide-react"
import { PullRequest } from '@/types/pull-request'

interface PRCardProps {
    pr: PullRequest
    isSelected: boolean
    onSelectionChange: (prId: number, checked: boolean) => void
}

export function PRCard({ pr, isSelected, onSelectionChange }: PRCardProps) {
    const getStateColor = () => {
        if (pr.merged) return 'text-purple-400 border-purple-400/30 bg-purple-500/5';
        if (pr.state === 'open') return 'text-[#00ff00] border-[#00ff00]/30 bg-[#00ff00]/5';
        return 'text-red-400 border-red-400/30 bg-red-500/5';
    };

    const getStateLabel = () => {
        if (pr.merged) return 'merged';
        return pr.state;
    };

    return (
        <div className={`
            bg-[#0d0d0d] border transition-all duration-200 rounded-lg p-5 font-mono
            ${isSelected 
                ? 'border-[#00ff00] bg-[#00ff00]/5 shadow-lg shadow-[#00ff00]/20' 
                : 'border-[#333] hover:border-[#00ff00]/50 hover:bg-[#1a1a1a]/50'
            }
        `}>
            {/* Header with checkbox and PR info */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked: boolean) => onSelectionChange(pr.id, checked)}
                        className="bg-[#1a1a1a] border-[#333] accent-[#00ff00] mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                        <a
                            href={pr.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-white hover:text-[#00ff00] transition-colors flex items-center gap-1.5 break-words"
                        >
                            <GitPullRequest className="w-4 h-4 flex-shrink-0" />
                            {pr.repository.fullName}#{pr.number}
                            <ExternalLink className="w-3.5 h-3.5 text-[#666] opacity-50 flex-shrink-0" />
                        </a>
                        <div className="text-sm text-white mt-0.5 break-words">
                            {pr.title}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {pr.body && (
                <div className="text-xs text-[#888] mb-3 line-clamp-2">
                    {pr.body}
                </div>
            )}

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-3">
                <Badge
                    variant="outline"
                    className={`${getStateColor()} text-xs`}
                >
                    {getStateLabel()}
                </Badge>

                {pr.draft && (
                    <Badge
                        variant="secondary"
                        className="bg-[#666]/20 text-[#888] border-[#666]/30 text-xs"
                    >
                        draft
                    </Badge>
                )}

                {pr.labels.map((label) => (
                    <Badge
                        key={label.id}
                        variant="outline"
                        className="border-[#666]/30 text-[#888] bg-[#1a1a1a] text-xs"
                    >
                        {label.name}
                    </Badge>
                ))}
            </div>

            {/* Author and stats */}
            <div className="grid grid-cols-2 gap-3 text-xs text-[#666] mb-3">
                <div>
                    <span className="text-[#888]">by:</span> {pr.user.login}
                </div>
                <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{pr.comments + pr.reviewComments}</span>
                </div>
                <div className="flex items-center gap-1">
                    <GitCompare className="w-3 h-3" />
                    <span>{pr.commits} commits</span>
                </div>
                <div>
                    <span className="text-[#888]">+{pr.additions}</span>
                    <span className="text-red-400"> -{pr.deletions}</span>
                </div>
            </div>

            {/* Reviewers */}
            {pr.reviewers && pr.reviewers.length > 0 && (
                <div className="mb-3 pb-3 border-b border-[#333]">
                    <div className="text-xs text-[#666] mb-1">reviewers:</div>
                    <div className="flex flex-wrap gap-2">
                        {pr.reviewers.slice(0, 3).map((reviewer) => (
                            <Badge
                                key={reviewer.id}
                                variant="outline"
                                className="border-[#333] text-[#888] bg-[#1a1a1a]/50 text-xs"
                            >
                                {reviewer.login}
                            </Badge>
                        ))}
                        {pr.reviewers.length > 3 && (
                            <Badge
                                variant="outline"
                                className="border-[#333] text-[#888] bg-[#1a1a1a]/50 text-xs"
                            >
                                +{String(Math.max(0, pr.reviewers.length - 3))} more
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center justify-between text-xs text-[#666] border-t border-[#333] pt-2">
                <span>created: {new Date(pr.createdAt).toLocaleDateString()}</span>
                <span className="text-right">
                    {pr.merged ? `merged: ${new Date(pr.mergedAt!).toLocaleDateString()}` : `updated: ${new Date(pr.updatedAt).toLocaleDateString()}`}
                </span>
            </div>
        </div>
    )
}
