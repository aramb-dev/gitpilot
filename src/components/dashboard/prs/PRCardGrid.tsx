import { Checkbox } from "@/components/ui/checkbox"
import { PRCard } from './PRCard'
import { PullRequest } from '@/types/pull-request'

interface PRCardGridProps {
    pullRequests: PullRequest[]
    selectedPRs: number[]
    selectAll: boolean
    onSelectAll: (checked: boolean) => void
    onSelectPR: (prId: number, checked: boolean) => void
}

export function PRCardGrid({
    pullRequests,
    selectedPRs,
    selectAll,
    onSelectAll,
    onSelectPR
}: PRCardGridProps) {
    return (
        <div className="space-y-4">
            {/* Select All Header */}
            <div className="flex items-center gap-3 px-1">
                <Checkbox
                    checked={selectAll}
                    onCheckedChange={onSelectAll}
                    className="bg-[#1a1a1a] border-[#333] accent-[#00ff00]"
                />
                <span className="text-sm text-[#666] font-mono">
                    {selectedPRs.length > 0 && `${selectedPRs.length} selected`}
                    {selectedPRs.length === 0 && 'select all'}
                </span>
            </div>

            {/* Card Grid */}
            {pullRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                    {pullRequests.map((pr) => (
                        <PRCard
                            key={pr.id}
                            pr={pr}
                            isSelected={selectedPRs.includes(pr.id)}
                            onSelectionChange={onSelectPR}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-[#666] font-mono border border-[#333] bg-[#0d0d0d] rounded-lg">
                    no pull requests found
                </div>
            )}
        </div>
    )
}
