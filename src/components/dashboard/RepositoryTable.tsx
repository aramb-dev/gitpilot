import { Checkbox } from '@/components/ui/checkbox';
import type { Repository } from '@/types/dashboard';
import { RepositoryRow } from './RepositoryRow';

interface RepositoryTableProps {
  repositories: Repository[];
  selectedRepos: number[];
  selectAll: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRepo: (repoId: number, checked: boolean) => void;
}

export function RepositoryTable({
  repositories,
  selectedRepos,
  selectAll,
  onSelectAll,
  onSelectRepo,
}: RepositoryTableProps) {
  return (
    <div className="bg-[#0d0d0d] border border-[#333] overflow-hidden font-mono">
      <table className="w-full">
        <thead className="bg-[#1a1a1a] border-b border-[#333]">
          <tr>
            <th className="p-4 w-12">
              <Checkbox
                checked={selectAll}
                onCheckedChange={onSelectAll}
                className="bg-[#1a1a1a] border-[#333] accent-[#00ff00]"
              />
            </th>
            <th className="p-4 text-left text-sm text-[#666]">name</th>
            <th className="p-4 text-left text-sm text-[#666]">visibility</th>
            <th className="p-4 text-left text-sm text-[#666]">stars</th>
            <th className="p-4 text-left text-sm text-[#666]">updated</th>
          </tr>
        </thead>
        <tbody>
          {repositories.length > 0 ? (
            repositories.map((repo) => (
              <RepositoryRow
                key={repo.id}
                repository={repo}
                isSelected={selectedRepos.includes(repo.id)}
                onSelectionChange={onSelectRepo}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-12 text-center text-[#666] font-mono">
                no data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
