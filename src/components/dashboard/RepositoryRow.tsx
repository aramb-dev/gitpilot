import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Star, ExternalLink } from "lucide-react"
import { Repository } from '@/types/dashboard'

interface RepositoryRowProps {
    repository: Repository
    isSelected: boolean
    onSelectionChange: (repoId: number, checked: boolean) => void
}

export function RepositoryRow({ repository, isSelected, onSelectionChange }: RepositoryRowProps) {
    return (
        <tr className={`border-b border-gray-800 transition-colors ${
            isSelected ? 'bg-blue-900/10' : 'hover:bg-gray-800/50'
        }`}>
            <td className="p-4">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked: boolean) => onSelectionChange(repository.id, checked)}
                    className="bg-gray-800 border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
            </td>
            <td className="p-4">
                <div className="flex items-center space-x-2">
                    <a 
                        href={repository.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-semibold text-white hover:text-blue-400 flex items-center gap-1.5 transition-colors"
                    >
                        {repository.name}
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500 opacity-50" />
                    </a>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{repository.full_name}</div>
            </td>
            <td className="p-4">
                <Badge
                    variant={repository.visibility === 'Public' ? 'outline' : 'secondary'}
                    className={repository.visibility === 'Public'
                        ? 'border-green-800/50 text-green-400 bg-green-900/10'
                        : 'bg-purple-900/20 text-purple-400 border-purple-800/50'
                    }
                >
                    {repository.visibility}
                </Badge>
            </td>
            <td className="p-4">
                <div className="flex items-center text-sm text-gray-300">
                    <Star className="w-3.5 h-3.5 mr-1.5 text-yellow-500/80" />
                    {repository.stars}
                </div>
            </td>
            <td className="p-4 text-sm text-gray-400">{repository.updated}</td>
        </tr>
    )
}
