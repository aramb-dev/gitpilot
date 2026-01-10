'use client';

import { useState } from 'react';
import { X, XCircle, RotateCcw, Tag, UserPlus, Lock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Issue, IssueLabel, IssueUser, BulkIssueAction } from '@/types/issue';

interface BulkActionBarProps {
  selectedIssues: Issue[];
  onClearSelection: () => void;
  onExecuteAction: (action: BulkIssueAction) => Promise<void>;
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

  if (selectedIssues.length === 0) return null;

  const openCount = selectedIssues.filter((i) => i.state === 'open').length;
  const closedCount = selectedIssues.filter((i) => i.state === 'closed').length;

  const handleClose = async () => {
    await onExecuteAction({ type: 'close' });
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

  const handleAssign = async (assignee: string) => {
    setShowAssigneePicker(false);
    await onExecuteAction({ type: 'assign', assignees: [assignee] });
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#161b22] border-t border-gray-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Selection info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClearSelection}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm text-white font-medium">
              {selectedIssues.length} issue{selectedIssues.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Close button - only show if there are open issues */}
            {openCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isExecuting}
                className="text-red-400 border-red-800 hover:bg-red-900/20"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Close {openCount > 1 ? `(${openCount})` : ''}
              </Button>
            )}

            {/* Reopen button - only show if there are closed issues */}
            {closedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReopen}
                disabled={isExecuting}
                className="text-green-400 border-green-800 hover:bg-green-900/20"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reopen {closedCount > 1 ? `(${closedCount})` : ''}
              </Button>
            )}

            {/* Label picker */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLabelPicker(!showLabelPicker);
                  setShowAssigneePicker(false);
                  setShowMoreActions(false);
                }}
                disabled={isExecuting}
              >
                <Tag className="w-4 h-4 mr-1.5" />
                Label
              </Button>

              {showLabelPicker && (
                <div className="absolute bottom-full mb-2 right-0 w-64 bg-[#161b22] border border-gray-800 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-800 text-xs text-gray-500 font-medium">
                    Add or remove label
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableLabels.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        No labels available
                      </div>
                    ) : (
                      availableLabels.map((label) => (
                        <div
                          key={label.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-800"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: `#${label.color}` }}
                            />
                            <span className="text-sm text-gray-300">{label.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAddLabel(label.name)}
                              className="px-2 py-0.5 text-xs text-green-400 hover:bg-green-900/20 rounded"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => handleRemoveLabel(label.name)}
                              className="px-2 py-0.5 text-xs text-red-400 hover:bg-red-900/20 rounded"
                            >
                              Remove
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
                onClick={() => {
                  setShowAssigneePicker(!showAssigneePicker);
                  setShowLabelPicker(false);
                  setShowMoreActions(false);
                }}
                disabled={isExecuting}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Assign
              </Button>

              {showAssigneePicker && (
                <div className="absolute bottom-full mb-2 right-0 w-56 bg-[#161b22] border border-gray-800 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-800 text-xs text-gray-500 font-medium">
                    Assign to user
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableAssignees.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        No assignees available
                      </div>
                    ) : (
                      availableAssignees.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleAssign(user.login)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-800 transition-colors"
                        >
                          <img
                            src={user.avatarUrl}
                            alt={user.login}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-gray-300">{user.login}</span>
                        </button>
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
                <div className="absolute bottom-full mb-2 right-0 w-40 bg-[#161b22] border border-gray-800 rounded-lg shadow-xl overflow-hidden">
                  <button
                    onClick={handleLock}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Lock
                  </button>
                  <button
                    onClick={handleUnlock}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Unlock
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isExecuting && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
            Processing...
          </div>
        )}
      </div>
    </div>
  );
}
