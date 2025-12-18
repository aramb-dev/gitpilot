import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { Repository } from '@/types/dashboard'

interface RepositoryRowProps {
    repository: Repository
    isSelected: boolean
    onSelectionChange: (repoId: number, checked: boolean) => void
}

export function RepositoryRow({ repository, isSelected, onSelectionChange }: RepositoryRowProps) {
    return (
        <tr className="border-b border-gray-800 hover:bg-gray-800/50">
            <td className="p-4">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked: boolean) => onSelectionChange(repository.id, checked)}
                    className="bg-gray-800 border-gray-600"
                />
            </td>
            <td className="p-4">
                <div className="font-medium text-white">{repository.name}</div>
                <div className="text-xs text-gray-500">{repository.full_name}</div>
            </td>
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
                    <Star className="w-4 h-4 mr-1.5 text-yellow-500" />
                    {repository.stars}
                </div>
            </td>
            <td className="p-4 text-gray-400">{repository.updated}</td>
        </tr>
    )
}
