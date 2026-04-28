'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface BulkItemStatus {
  id: string | number;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

interface BulkOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: BulkItemStatus[];
  isCompleted: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
}

export function BulkOperationModal({
  isOpen,
  onClose,
  title,
  items,
  isCompleted,
  onCancel,
  onRetry,
}: BulkOperationModalProps) {
  const total = items.length;
  const processed = items.filter((i) => i.status === 'success' || i.status === 'error').length;
  const succeeded = items.filter((i) => i.status === 'success').length;
  const failed = items.filter((i) => i.status === 'error').length;
  const progress = total > 0 ? (processed / total) * 100 : 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && (isCompleted || !onCancel)) {
          onClose();
        }
      }}
    >
      <DialogContent className="bg-[#0d0d0d] border border-[#333] text-white font-mono rounded-none max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="text-[#00ff00]">&gt;</span> {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4 py-4">
          {/* Progress Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#666]">
              <span>
                PROGRESS: {processed}/{total}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1 bg-[#1a1a1a] border border-[#333]">
              <div
                className="h-full bg-[#00ff00] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex gap-4 text-[10px]">
              <span className="text-[#00ff00] tracking-tighter">SUCCESS: {succeeded}</span>
              <span className="text-red-500 tracking-tighter">FAILED: {failed}</span>
              {!isCompleted && <span className="text-[#888] animate-pulse">PROCESSING...</span>}
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto border border-[#333] bg-[#050505]">
            <div className="divide-y divide-[#1a1a1a]">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {item.status === 'pending' && <div className="w-4 h-4 border border-[#333]" />}
                    {item.status === 'processing' && (
                      <Loader2 className="w-4 h-4 text-[#00ff00] animate-spin" />
                    )}
                    {item.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-[#00ff00]" />
                    )}
                    {item.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                    <span className="truncate text-[#888]">{item.label}</span>
                  </div>
                  {item.error && (
                    <span className="text-[10px] text-red-500 italic ml-2 truncate max-w-[150px]">
                      {item.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
          {!isCompleted && onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="bg-[#0d0d0d] border-[#333] text-red-500 hover:bg-red-500/10 hover:border-red-500 font-mono rounded-none h-9"
            >
              CANCEL_OPERATION
            </Button>
          )}
          {isCompleted && failed > 0 && onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="bg-[#0d0d0d] border-red-500 text-red-500 hover:bg-red-500/10 font-mono rounded-none h-9"
            >
              RETRY_FAILED
            </Button>
          )}
          {isCompleted && (
            <Button
              onClick={onClose}
              className="bg-[#00ff00] hover:bg-[#00cc00] text-black font-bold font-mono rounded-none h-9 px-8"
            >
              DONE
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
