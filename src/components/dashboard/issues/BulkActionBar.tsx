'use client';

import { Lock, MoreHorizontal, RotateCcw, Tag, UserPlus, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BulkIssueAction, Issue, IssueLabel, IssueUser } from '@/types/issue';
import { CloseIssueModal } from './CloseIssueModal';

interface BulkActionBarProps {
  selectedIssues: Issue[];
  onClearSelection: () => void;
  onExecuteAction: (action: BulkIssueAction) => Promise<unknown>;
  isExecuting: boolean;
  availableLabels: IssueLabel[];
  availableAssignees: IssueUser[];
}

export function BulkActionBar({
  selectedIssues,
  onClearSelection,
  onExecuteAction,
  isExecuting,
  availableLabels,
  availableAssignees,
}: BulkActionBarProps) {
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  if (selectedIssues.length === 0) return null;

  const openCount = selectedIssues.filter((i) => i.state === 'open').length;
  const closedCount = selectedIssues.filter((i) => i.state === 'closed').length;

  const handleClose = async (comment?: string) => {
    setShowCloseModal(false);
    await onExecuteAction({ type: 'close', comment });
  };

  const handleReopen = async () => {
    await onExecuteAction({ type: 'reopen' });
  };

  const handleAddLabel = async (label: string) => {
    setShowLabelPicker(false);
    await onExecuteAction({ type: 'add_labels', labels: [label] });
  };

  const handleRemoveLabel = async (label: string) => {
    setShowLabelPicker(false);
    await onExecuteAction({ type: 'remove_labels', labels: [label] });
  };

  const handleSetLabel = async (label: string) => {
    setShowLabelPicker(false);
    await onExecuteAction({ type: 'set_labels', labels: [label] });
  };

  const handleAssign = async (assignee: string) => {
    setShowAssigneePicker(false);
    await onExecuteAction({ type: 'assign', assignees: [assignee] });
  };

  const handleUnassign = async (assignee: string) => {
    setShowAssigneePicker(false);
    await onExecuteAction({ type: 'unassign', assignees: [assignee] });
  };

  const handleLock = async () => {
    setShowMoreActions(false);
    await onExecuteAction({ type: 'lock' });
  };

  const handleUnlock = async () => {
    setShowMoreActions(false);
    await onExecuteAction({ type: 'unlock' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d] border-t border-[#333] shadow-2xl font-mono">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Selection info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClearSelection}
              className="p-1 text-[#666] hover:text-[#00ff00] transition-colors"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm text-white font-bold">
              [{selectedIssues.length} ISSUES_SELECTED]
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Close button - only show if there are open issues */}
            {openCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCloseModal(true)}
                disabled={isExecuting}
                className="text-red-500 border-red-900 bg-red-900/5 hover:bg-red-900/20"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                CLOSE {openCount > 1 ? `(${openCount})` : ''}
              </Button>
            )}

            {/* Reopen button - only show if there are closed issues */}
            {closedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReopen}
                disabled={isExecuting}
                className="text-[#00ff00] border-[#00ff00]/30 bg-[#00ff00]/5 hover:bg-[#00ff00]/10"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                REOPEN {closedCount > 1 ? `(${closedCount})` : ''}
              </Button>
            )}

            <CloseIssueModal
              isOpen={showCloseModal}
              onClose={() => setShowCloseModal(false)}
              onConfirm={handleClose}
              count={openCount}
              isLoading={isExecuting}
            />

            {/* Label picker */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00]"
                onClick={() => {
                  setShowLabelPicker(!showLabelPicker);
                  setShowAssigneePicker(false);
                  setShowMoreActions(false);
                }}
                disabled={isExecuting}
              >
                <Tag className="w-4 h-4 mr-1.5" />
                LABEL
              </Button>

              {showLabelPicker && (
                <div className="absolute bottom-full mb-2 right-0 w-64 bg-[#0d0d0d] border border-[#333] shadow-2xl">
                  <div className="p-2 border-b border-[#333] text-[10px] text-[#666] uppercase">
                    // edit_labels
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableLabels.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-[#666] text-center italic">
                        no_labels_available
                      </div>
                    ) : (
                      availableLabels.map((label) => (
                        <div
                          key={label.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1a1a]"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 border border-[#333]"
                              style={{ backgroundColor: `#${label.color}` }}
                            />
                            <span className="text-xs text-[#888]">{label.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAddLabel(label.name)}
                              className="px-2 py-0.5 text-[10px] text-[#00ff00] hover:bg-[#00ff00]/10 border border-[#00ff00]/30"
                              title="Add label"
                            >
                              ADD
                            </button>
                            <button
                              onClick={() => handleRemoveLabel(label.name)}
                              className="px-2 py-0.5 text-[10px] text-red-500 hover:bg-red-500/10 border border-red-500/30"
                              title="Remove label"
                            >
                              REM
                            </button>
                            <button
                              onClick={() => handleSetLabel(label.name)}
                              className="px-2 py-0.5 text-[10px] text-blue-500 hover:bg-blue-500/10 border border-blue-500/30"
                              title="Set as only label"
                            >
                              SET
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Assignee picker */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00]"
                onClick={() => {
                  setShowAssigneePicker(!showAssigneePicker);
                  setShowLabelPicker(false);
                  setShowMoreActions(false);
                }}
                disabled={isExecuting}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                ASSIGN
              </Button>

              {showAssigneePicker && (
                <div className="absolute bottom-full mb-2 right-0 w-64 bg-[#0d0d0d] border border-[#333] shadow-2xl">
                  <div className="p-2 border-b border-[#333] text-[10px] text-[#666] uppercase">
                    // edit_assignees
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableAssignees.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-[#666] text-center italic">
                        no_assignees_available
                      </div>
                    ) : (
                      availableAssignees.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1a1a]"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={user.avatarUrl}
                              alt={user.login}
                              className="w-5 h-5 border border-[#333]"
                            />
                            <span className="text-xs text-[#888]">{user.login}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAssign(user.login)}
                              className="px-2 py-0.5 text-[10px] text-[#00ff00] hover:bg-[#00ff00]/10 border border-[#00ff00]/30"
                            >
                              ADD
                            </button>
                            <button
                              onClick={() => handleUnassign(user.login)}
                              className="px-2 py-0.5 text-[10px] text-red-500 hover:bg-red-500/10 border border-red-500/30"
                            >
                              REM
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* More actions */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="border-[#333] hover:border-[#00ff00] text-[#888] hover:text-[#00ff00]"
                onClick={() => {
                  setShowMoreActions(!showMoreActions);
                  setShowLabelPicker(false);
                  setShowAssigneePicker(false);
                }}
                disabled={isExecuting}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              {showMoreActions && (
                <div className="absolute bottom-full mb-2 right-0 w-40 bg-[#0d0d0d] border border-[#333] shadow-2xl">
                  <button
                    onClick={handleLock}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    LOCK_ISSUE
                  </button>
                  <button
                    onClick={handleUnlock}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    UNLOCK_ISSUE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isExecuting && (
          <div className="mt-2 flex items-center gap-2 text-xs text-[#00ff00]">
            <span className="w-3.5 h-3.5 border-2 border-[#00ff00]/30 border-t-[#00ff00] rounded-none animate-spin" />
            &gt; processing_bulk_action...
          </div>
        )}
      </div>
    </div>
  );
}
