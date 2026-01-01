import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface RepositoryActionsProps {
    hasSelectedRepos: boolean
    visibilityLabel: string
    onToggleVisibility: () => void
    onArchive: () => void
    onDelete: () => void
    onSearch: (query: string) => void
    visibilityFilter: string
    onVisibilityChange: (value: string) => void
    languageFilter: string
    onLanguageChange: (value: string) => void
    languages: string[]
}

export function RepositoryActions({
    hasSelectedRepos,
    visibilityLabel,
    onToggleVisibility,
    onArchive,
    onDelete,
    onSearch,
    visibilityFilter,
    onVisibilityChange,
    languageFilter,
    onLanguageChange,
    languages
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
            
            <select 
                value={visibilityFilter}
                onChange={(e) => onVisibilityChange(e.target.value)}
                className="bg-[#21262d] text-gray-300 border-gray-700 rounded-md px-3 py-1 text-sm focus:ring-blue-500 outline-none"
            >
                <option value="all">All Visibility</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
            </select>

            <select 
                value={languageFilter}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-[#21262d] text-gray-300 border-gray-700 rounded-md px-3 py-1 text-sm focus:ring-blue-500 outline-none"
            >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>

            <Button
                variant="outline"
                disabled={!hasSelectedRepos}
                onClick={onToggleVisibility}
                className="bg-[#21262d] text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
            >
                {visibilityLabel}
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
