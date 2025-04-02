import { useState, useCallback } from 'react';
import {
  batchChangeVisibility,
  batchDeleteRepositories
} from '../services/github';
import { useUiStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';

/**
 * Hook for performing bulk operations on GitHub repositories
 */
export const useBulkOperation = () => {
  const { addToast, setActiveOperation, setOperationResults, clearActiveOperation } = useUiStore();
  const { fetchRepositories, clearSelection } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  // Handler for bulk visibility changes
  const changeBulkVisibility = useCallback(async (repositories, makePrivate) => {
    if (!repositories || repositories.length === 0) {
      addToast({
        title: 'No repositories selected',
        description: 'Please select at least one repository.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    setProgress({ completed: 0, total: repositories.length });

    try {
      // Set active operation for UI tracking
      setActiveOperation({
        type: 'change_visibility',
        description: `Changing ${repositories.length} repositories to ${makePrivate ? 'private' : 'public'}`,
        total: repositories.length,
      });

      // Track progress
      const onProgress = (completed, total) => {
        setProgress({ completed, total });
      };

      // Execute the bulk operation
      const results = await batchChangeVisibility(repositories, makePrivate, onProgress);

      // Store and display results
      setOperationResults(results);

      // Show toast based on results
      if (results.errors.length === 0) {
        addToast({
          title: 'Visibility changed successfully',
          description: `Changed ${results.results.length} repositories to ${makePrivate ? 'private' : 'public'}.`,
          type: 'success',
        });
      } else if (results.results.length === 0) {
        addToast({
          title: 'Failed to change visibility',
          description: `Failed to change any repositories. Please check errors and try again.`,
          type: 'error',
        });
      } else {
        addToast({
          title: 'Partially completed',
          description: `Changed ${results.results.length} repositories, but ${results.errors.length} failed.`,
          type: 'warning',
        });
      }

      // Refresh repository list
      await fetchRepositories(true);
      clearSelection();

      return results;
    } catch (error) {
      console.error('Error performing bulk visibility change:', error);
      addToast({
        title: 'Operation failed',
        description: error.message || 'An unexpected error occurred.',
        type: 'error',
      });
    } finally {
      setLoading(false);
      clearActiveOperation();
    }
  }, [addToast, setActiveOperation, setOperationResults, clearActiveOperation, fetchRepositories, clearSelection]);

  // Handler for bulk deletion
  const deleteBulkRepositories = useCallback(async (repositories) => {
    if (!repositories || repositories.length === 0) {
      addToast({
        title: 'No repositories selected',
        description: 'Please select at least one repository.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    setProgress({ completed: 0, total: repositories.length });

    try {
      // Set active operation for UI tracking
      setActiveOperation({
        type: 'delete',
        description: `Deleting ${repositories.length} repositories`,
        total: repositories.length,
      });

      // Track progress
      const onProgress = (completed, total) => {
        setProgress({ completed, total });
      };

      // Execute the bulk operation
      const results = await batchDeleteRepositories(repositories, onProgress);

      // Store and display results
      setOperationResults(results);

      // Show toast based on results
      if (results.errors.length === 0) {
        addToast({
          title: 'Repositories deleted successfully',
          description: `Deleted ${results.results.length} repositories.`,
          type: 'success',
        });
      } else if (results.results.length === 0) {
        addToast({
          title: 'Failed to delete repositories',
          description: `Failed to delete any repositories. Please check errors and try again.`,
          type: 'error',
        });
      } else {
        addToast({
          title: 'Partially completed',
          description: `Deleted ${results.results.length} repositories, but ${results.errors.length} failed.`,
          type: 'warning',
        });
      }

      // Refresh repository list
      await fetchRepositories(true);
      clearSelection();

      return results;
    } catch (error) {
      console.error('Error performing bulk deletion:', error);
      addToast({
        title: 'Operation failed',
        description: error.message || 'An unexpected error occurred.',
        type: 'error',
      });
    } finally {
      setLoading(false);
      clearActiveOperation();
    }
  }, [addToast, setActiveOperation, setOperationResults, clearActiveOperation, fetchRepositories, clearSelection]);

  return {
    loading,
    progress,
    changeBulkVisibility,
    deleteBulkRepositories
  };
};
