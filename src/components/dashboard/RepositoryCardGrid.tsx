import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import type { Repository } from '@/types/dashboard';
import { RepositoryCard } from './RepositoryCard';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

interface RepositoryCardGridProps {
  repositories: Repository[];
  selectedRepos: number[];
  selectAll: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRepo: (repoId: number, checked: boolean) => void;
}

export function RepositoryCardGrid({
  repositories,
  selectedRepos,
  selectAll,
  onSelectAll,
  onSelectRepo,
}: RepositoryCardGridProps) {
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
          {selectedRepos.length > 0 && `${selectedRepos.length} selected`}
          {selectedRepos.length === 0 && 'select all'}
        </span>
      </div>

      {/* Card Grid */}
      {repositories.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max"
        >
          {repositories.map((repo) => (
            <motion.div key={repo.id} variants={item}>
              <RepositoryCard
                repository={repo}
                isSelected={selectedRepos.includes(repo.id)}
                onSelectionChange={onSelectRepo}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="p-12 text-center text-[#666] font-mono border border-[#333] bg-[#0d0d0d] rounded-lg">
          no repositories found
        </div>
      )}
    </div>
  );
}
