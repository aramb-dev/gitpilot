import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface RepositoryActionsProps {
    hasSelectedRepos: boolean
    onMakePrivate: () => void
    onArchive: () => void
    onDelete: () => void
    onSearch: (query: string) => void
}

export function RepositoryActions({
    hasSelectedRepos,
    onMakePrivate,
    onArchive,
    onDelete,
    onSearch
}: RepositoryActionsProps) {
    return (
        <div className="flex items-center space-x-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    type="search"
                    placeholder="Search repositories..."
                    className="bg-[#0d1117] border-gray-700 pl-10 w-64 focus:ring-blue-500"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
            <Button
                variant="outline"
                disabled={!hasSelectedRepos}
                onClick={onMakePrivate}
                className="bg-[#21262d] text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
            >
                Make Private
            </Button>
            <Button
                variant="outline"
                disabled={!hasSelectedRepos}
                onClick={onArchive}
                className="bg-[#21262d] text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
            >
                Archive
            </Button>
            <Button
                variant="destructive"
                disabled={!hasSelectedRepos}
                onClick={onDelete}
                className="bg-red-800/50 text-red-300 border-red-600/50 hover:bg-red-800/80 disabled:opacity-50"
            >
                Delete
            </Button>
        </div>
    )
}
