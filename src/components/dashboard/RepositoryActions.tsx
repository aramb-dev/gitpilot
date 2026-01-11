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
        <div className="flex items-center space-x-2 font-mono">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666] w-4 h-4" />
                <Input
                    type="search"
                    placeholder="search..."
                    className="bg-[#1a1a1a] border-[#333] pl-10 w-64 focus:ring-[#00ff00] text-sm h-9 text-[#888] placeholder:text-[#666]"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <select
                value={visibilityFilter}
                onChange={(e) => onVisibilityChange(e.target.value)}
                className="bg-[#1a1a1a] text-[#888] border border-[#333] px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#00ff00] outline-none transition-all hover:border-[#00ff00] cursor-pointer font-mono"
            >
                <option value="all">all_visibility</option>
                <option value="Public">public</option>
                <option value="Private">private</option>
            </select>

            <select
                value={languageFilter}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-[#1a1a1a] text-[#888] border border-[#333] px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#00ff00] outline-none transition-all hover:border-[#00ff00] cursor-pointer font-mono"
            >
                <option value="all">all_languages</option>
                {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>

            <Button
                variant="outline"
                disabled={!hasSelectedRepos}
                onClick={onToggleVisibility}
                className="bg-[#1a1a1a] text-[#00ff00] border-[#333] hover:bg-[#00ff00]/10 hover:border-[#00ff00] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm h-9"
            >
                {visibilityLabel}
            </Button>
            <Button
                variant="outline"
                disabled={!hasSelectedRepos}
                onClick={onArchive}
                className="bg-[#1a1a1a] text-[#888] border-[#333] hover:bg-[#1a1a1a] hover:border-[#00ff00] hover:text-[#00ff00] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm h-9"
            >
                archive
            </Button>
            <Button
                variant="outline"
                disabled={!hasSelectedRepos}
                onClick={onDelete}
                className="bg-[#1a1a1a] text-red-500 border-[#333] hover:bg-red-500/10 hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm h-9"
            >
                delete
            </Button>
        </div>
    )
}
