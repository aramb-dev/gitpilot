'use client';

import { MessageSquare, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CloseIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  count: number;
  isLoading?: boolean;
}

export function CloseIssueModal({
  isOpen,
  onClose,
  onConfirm,
  count,
  isLoading = false,
}: CloseIssueModalProps) {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0d0d] border border-[#333] text-white font-mono rounded-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            // CLOSE_ISSUES
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-3 bg-red-500/5 border border-red-500/20 text-sm text-red-200">
            &gt; closing <span className="text-white font-bold">{count}</span> issue
            {count !== 1 ? 's' : ''}.
          </div>

          <div className="space-y-3">
            <label className="text-xs text-[#666] uppercase tracking-widest block">
              Add a closing comment (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#444]" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. bulk closed by gitpilot"
                className="w-full pl-10 pr-3 py-2 bg-[#1a1a1a] border border-[#333] text-white font-mono placeholder-[#444] focus:ring-[#00ff00] rounded-none h-24 resize-none"
              />
            </div>
          </div>

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
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none"
            >
              {isLoading ? 'CLOSING...' : 'CONFIRM_CLOSE'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
