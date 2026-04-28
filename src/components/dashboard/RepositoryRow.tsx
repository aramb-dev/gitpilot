import { ExternalLink, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Repository } from '@/types/dashboard';

interface RepositoryRowProps {
  repository: Repository;
  isSelected: boolean;
  onSelectionChange: (repoId: number, checked: boolean) => void;
}

export function RepositoryRow({ repository, isSelected, onSelectionChange }: RepositoryRowProps) {
  return (
    <tr
      className={`border-b border-[#333] transition-colors font-mono ${
        isSelected ? 'bg-[#00ff00]/10' : 'hover:bg-[#1a1a1a]/50'
      }`}
    >
      <td className="p-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked: boolean) => onSelectionChange(repository.id, checked)}
          className="bg-[#1a1a1a] border-[#333] accent-[#00ff00]"
        />
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white hover:text-[#00ff00] flex items-center gap-1.5 transition-colors"
          >
            {repository.name}
            <ExternalLink className="w-3.5 h-3.5 text-[#666] opacity-50" />
          </a>
        </div>
        <div className="text-xs text-[#666] mt-0.5">{repository.full_name}</div>
      </td>
      <td className="p-4">
        <Badge
          variant={repository.visibility === 'public' ? 'outline' : 'secondary'}
          className={
            repository.visibility === 'public'
              ? 'border-[#00ff00]/30 text-[#00ff00] bg-[#00ff00]/5'
              : 'bg-[#888]/20 text-[#888] border-[#888]/30'
          }
        >
          {repository.visibility === 'public' ? 'public' : 'private'}
        </Badge>
      </td>
      <td className="p-4">
        <div className="flex items-center text-sm text-[#888]">
          <Star className="w-3.5 h-3.5 mr-1.5 text-[#00ff00]/60" />
          {repository.stars}
        </div>
      </td>
      <td className="p-4 text-sm text-[#666]">
        {new Date(repository.updated_at).toLocaleDateString()}
      </td>
    </tr>
  );
}
