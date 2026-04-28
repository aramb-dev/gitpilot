'use client';

import { GitCommit, GitMerge, GitPullRequest } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface PRMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: 'merge' | 'squash' | 'rebase', message: string) => void;
  count: number;
  isLoading?: boolean;
}

export function PRMergeModal({
  isOpen,
  onClose,
  onConfirm,
  count,
  isLoading = false,
}: PRMergeModalProps) {
  const [mergeMethod, setMergeMethod] = useState<'merge' | 'squash' | 'rebase'>('merge');
  const [commitMessage, setCommitMessage] = useState('');

  const handleConfirm = () => {
    onConfirm(mergeMethod, commitMessage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0d0d] border border-[#333] text-white font-mono rounded-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-purple-500" />
            {/* BULK_MERGE */}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-3 bg-purple-500/5 border border-purple-500/20 text-sm text-purple-200">
            &gt; merging <span className="text-white font-bold">{count}</span> pull request
            {count !== 1 ? 's' : ''}.
          </div>

          <div className="space-y-3">
            <label className="text-xs text-[#666] uppercase tracking-widest block">
              Merge Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMergeMethod('merge')}
                className={`px-3 py-2 text-xs border transition-all flex flex-col items-center gap-2 ${
                  mergeMethod === 'merge'
                    ? 'bg-[#00ff00]/10 border-[#00ff00] text-[#00ff00]'
                    : 'bg-[#1a1a1a] border-[#333] text-[#666] hover:border-[#444]'
                }`}
              >
                <GitMerge className="w-4 h-4" />
                merge
              </button>
              <button
                type="button"
                onClick={() => setMergeMethod('squash')}
                className={`px-3 py-2 text-xs border transition-all flex flex-col items-center gap-2 ${
                  mergeMethod === 'squash'
                    ? 'bg-[#00ff00]/10 border-[#00ff00] text-[#00ff00]'
                    : 'bg-[#1a1a1a] border-[#333] text-[#666] hover:border-[#444]'
                }`}
              >
                <GitCommit className="w-4 h-4" />
                squash
              </button>
              <button
                type="button"
                onClick={() => setMergeMethod('rebase')}
                className={`px-3 py-2 text-xs border transition-all flex flex-col items-center gap-2 ${
                  mergeMethod === 'rebase'
                    ? 'bg-[#00ff00]/10 border-[#00ff00] text-[#00ff00]'
                    : 'bg-[#1a1a1a] border-[#333] text-[#666] hover:border-[#444]'
                }`}
              >
                <GitPullRequest className="w-4 h-4" />
                rebase
              </button>
            </div>
          </div>

          {mergeMethod !== 'rebase' && (
            <div className="space-y-3">
              <label 
                htmlFor="bulk-merge-message"
                className="text-xs text-[#666] uppercase tracking-widest block"
              >
                Custom Commit Message (Optional)
              </label>
              <Input
                id="bulk-merge-message"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="e.g. bulk merged by gitpilot"
                className="bg-[#1a1a1a] border border-[#333] text-white font-mono placeholder-[#444] focus:ring-[#00ff00] rounded-none h-10"
              />
              <p className="text-[10px] text-[#555]">
                * this message will be used for all selected pull requests.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-[#0d0d0d] border-[#333] text-[#888] hover:text-white hover:border-[#444] font-mono rounded-none"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-none"
            >
              {isLoading ? 'MERGING...' : 'CONFIRM_MERGE'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
