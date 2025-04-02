import React, { useState } from "react";
import { useBulkOperation } from "../../../hooks/useBulkOperation";
import {
  Trash2,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  Archive,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../common/Button";
import { Modal, ConfirmationModal } from "../../common/Modal";
import { Alert } from "../../common/Alert";
import { Card } from "../../common/Card";
import { Spinner } from "../../common/Spinner";

/**
 * @typedef {Object} BulkActionBarProps
 * @property {number} selectedCount - Number of selected repositories
 * @property {number} totalCount - Total number of repositories
 * @property {boolean} isAllSelected - Whether all repositories are selected
 * @property {boolean} isSomeSelected - Whether some repositories are selected
 * @property {(event: React.MouseEvent<HTMLButtonElement>) => void} onSelectAll - Function to select all repositories
 * @property {(event: React.MouseEvent<HTMLButtonElement>) => void} onClearSelection - Function to clear selection
 * @property {Array} selectedRepositories - Array of selected repositories
 */

/**
 * Component for handling bulk actions on repositories
 * @param {BulkActionBarProps} props - Component props
 */
const BulkActionBar = ({
  selectedCount,
  totalCount,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  onClearSelection,
  selectedRepositories,
}) => {
  // State for different modals
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [makePrivate, setMakePrivate] = useState(true);

  const { loading, progress, changeBulkVisibility, deleteBulkRepositories } =
    useBulkOperation();

  // Handle changing visibility for multiple repositories
  const handleVisibilityChange = async () => {
    await changeBulkVisibility(selectedRepositories, makePrivate);
    setVisibilityModalOpen(false);
  };

  // Handle deleting multiple repositories
  const handleDelete = async () => {
    await deleteBulkRepositories(selectedRepositories);
    setDeleteModalOpen(false);
  };

  // Open make private modal
  const openMakePrivateModal = () => {
    setMakePrivate(true);
    setVisibilityModalOpen(true);
  };

  // Open make public modal
  const openMakePublicModal = () => {
    setMakePrivate(false);
    setVisibilityModalOpen(true);
  };

  return (
    <>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
        <div className="flex flex-wrap items-center gap-2">
          {/* Select all checkbox */}
          <Button
            variant="outline"
            size="sm"
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="mr-2"
          >
            {isAllSelected ? (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Deselect All
              </>
            ) : isSomeSelected ? (
              <>
                <div className="h-4 w-4 mr-2 relative">
                  <Square className="h-4 w-4 absolute" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-sm"></div>
                  </div>
                </div>
                Select All
              </>
            ) : (
              <>
                <Square className="h-4 w-4 mr-2" />
                Select All
              </>
            )}
          </Button>

          {/* Bulk action buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={openMakePrivateModal}
            disabled={selectedCount === 0}
          >
            <Lock className="h-4 w-4 mr-2" />
            Make Private
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={openMakePublicModal}
            disabled={selectedCount === 0}
          >
            <Unlock className="h-4 w-4 mr-2" />
            Make Public
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteModalOpen(true)}
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

          {/* Selected count display */}
          <div className="ml-auto text-sm text-muted-foreground">
            {selectedCount} of {totalCount} selected
          </div>
        </div>
      </div>

      {/* Make Private/Public Confirmation Modal */}
      <ConfirmationModal
        isOpen={visibilityModalOpen}
        onClose={() => setVisibilityModalOpen(false)}
        onConfirm={handleVisibilityChange}
        title={`Make ${selectedCount} ${selectedCount === 1 ? "repository" : "repositories"} ${makePrivate ? "private" : "public"}?`}
        confirmText={`Make ${makePrivate ? "Private" : "Public"}`}
        confirmVariant={makePrivate ? "primary" : "primary"}
        isLoading={loading}
        size="md"
      >
        <div className="space-y-4">
          <p>
            You are about to change the visibility of {selectedCount}{" "}
            {selectedCount === 1 ? "repository" : "repositories"} to{" "}
            {makePrivate ? "private" : "public"}.
          </p>
          {makePrivate ? (
            <Alert variant="warning" title="Making repositories private">
              Private repositories are only visible to you and people you
              explicitly share with.
            </Alert>
          ) : (
            <Alert variant="warning" title="Making repositories public">
              Public repositories are visible to anyone on the internet. Make
              sure you're not exposing sensitive information.
            </Alert>
          )}
          {loading && (
            <div className="flex items-center space-x-4">
              <Spinner size="sm" className="text-primary" />
              <div>
                <div className="font-medium">Processing...</div>
                <div className="text-sm text-muted-foreground">
                  {progress.completed} of {progress.total} processed
                </div>
              </div>
            </div>
          )}
        </div>
      </ConfirmationModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${selectedCount} ${selectedCount === 1 ? "repository" : "repositories"}?`}
        confirmText="Delete Repositories"
        confirmVariant="destructive"
        isLoading={loading}
        size="md"
      >
        <div className="space-y-4">
          <Alert variant="error" title="This action cannot be undone">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              This will permanently delete the selected repositories, including
              all stars, watchers, and forks.
            </div>
          </Alert>
          <div className="max-h-60 overflow-auto border rounded-md p-2">
            <h4 className="font-medium mb-2">Selected repositories:</h4>
            <ul className="space-y-1">
              {selectedRepositories.map((repo) => (
                <li
                  key={repo.id}
                  className="flex items-center py-1 px-2 border-b last:border-0"
                >
                  {repo.private ? (
                    <Lock className="h-3 w-3 mr-2 text-muted-foreground" />
                  ) : (
                    <Unlock className="h-3 w-3 mr-2 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {repo.owner.login}/{repo.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {loading && (
            <div className="flex items-center space-x-4">
              <Spinner size="sm" className="text-primary" />
              <div>
                <div className="font-medium">Deleting...</div>
                <div className="text-sm text-muted-foreground">
                  {progress.completed} of {progress.total} processed
                </div>
              </div>
            </div>
          )}
        </div>
      </ConfirmationModal>
    </>
  );
};

export default BulkActionBar;
