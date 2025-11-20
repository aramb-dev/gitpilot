import { memo } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { Repository } from '@/types/dashboard'

interface RepositoryRowProps {
    repository: Repository
    isSelected: boolean
    onSelectionChange: (repoId: number, checked: boolean) => void
}

export const RepositoryRow = memo(function RepositoryRow({ repository, isSelected, onSelectionChange }: RepositoryRowProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelectionChange(repository.id, !isSelected)
        }
    }

    return (
        <tr
            className="border-b border-gray-800 hover:bg-gray-800/50 focus-within:ring-2 focus-within:ring-blue-500"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            role="row"
            aria-selected={isSelected}
        >
            <td className="p-4">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked: boolean) => onSelectionChange(repository.id, checked)}
                    aria-label={`Select ${repository.name}`}
                    className="bg-gray-800 border-gray-600"
                />
            </td>
            <td className="p-4 font-medium text-white">{repository.name}</td>
            <td className="p-4">
                <Badge
                    variant={repository.visibility === 'Public' ? 'default' : 'secondary'}
                    className={repository.visibility === 'Public'
                        ? 'bg-green-800/50 text-green-300 hover:bg-green-800/70'
                        : 'bg-purple-800/50 text-purple-300 hover:bg-purple-800/70'
                    }
                >
                    {repository.visibility}
                </Badge>
            </td>
            <td className="p-4 text-gray-400">
                <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1.5 text-yellow-500" aria-hidden="true" />
                    <span aria-label={`${repository.stars} stars`}>{repository.stars}</span>
                </div>
            </td>
            <td className="p-4 text-gray-400">{repository.updated}</td>
        </tr>
    )
})
