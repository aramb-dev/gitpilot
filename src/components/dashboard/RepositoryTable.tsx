import { Checkbox } from "@/components/ui/checkbox"
import { RepositoryRow } from './RepositoryRow'
import { Repository } from '@/types/dashboard'

interface RepositoryTableProps {
    repositories: Repository[]
    selectedRepos: number[]
    selectAll: boolean
    onSelectAll: (checked: boolean) => void
    onSelectRepo: (repoId: number, checked: boolean) => void
}

export function RepositoryTable({
    repositories,
    selectedRepos,
    selectAll,
    onSelectAll,
    onSelectRepo
}: RepositoryTableProps) {
    return (
        <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-[#21262d] border-b border-gray-800">
                    <tr>
                        <th className="p-4 w-12">
                            <Checkbox
                                checked={selectAll}
                                onCheckedChange={onSelectAll}
                                className="bg-gray-800 border-gray-600"
                            />
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Name</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Visibility</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Stars</th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {repositories.map((repo) => (
                        <RepositoryRow
                            key={repo.id}
                            repository={repo}
                            isSelected={selectedRepos.includes(repo.id)}
                            onSelectionChange={onSelectRepo}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}
