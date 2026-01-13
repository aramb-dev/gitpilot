import { Checkbox } from "@/components/ui/checkbox"
import { PRCard } from './PRCard'
import { PullRequest } from '@/types/pull-request'

interface PRCardGridProps {
    pullRequests: PullRequest[]
    selectedPRs: number[] | Set<string>
    selectAll: boolean
    onSelectAll: (checked: boolean) => void
    onSelectPR: (pr: PullRequest | number, checked: boolean) => void
}

export function PRCardGrid({
    pullRequests,
    selectedPRs,
    selectAll,
    onSelectAll,
    onSelectPR
}: PRCardGridProps) {
    const isSelected = (prId: number) => {
        if (selectedPRs instanceof Set) {
            return selectedPRs.has(String(prId));
        }
        return selectedPRs.includes(prId);
    };

    const getSelectedCount = () => {
        if (selectedPRs instanceof Set) {
            return selectedPRs.size;
        }
        return selectedPRs.length;
    };

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
                    {getSelectedCount() > 0 ? `${getSelectedCount()} selected` : 'select all'}
                </span>
            </div>

            {/* Card Grid */}
            {pullRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                    {pullRequests.map((pr) => (
                        <PRCard
                            key={pr.id}
                            pr={pr}
                            isSelected={isSelected(pr.id)}
                            onSelectionChange={() => onSelectPR(pr, !isSelected(pr.id))}
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
