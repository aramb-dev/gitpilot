import { useCallback } from 'react';
import { useUiStore } from '../store/uiStore';

/**
 * Hook for displaying toast notifications
 */
export const useToast = () => {
  const { addToast: storeAddToast, removeToast, clearToasts, toasts } = useUiStore();

  // Helper for creating standardized success toasts
  const showSuccess = useCallback((title, description) => {
    return storeAddToast({
      title,
      description,
      type: 'success',
      duration: 5000,
    });
  }, [storeAddToast]);

  // Helper for creating standardized error toasts
  const showError = useCallback((title, description) => {
    return storeAddToast({
      title,
      description,
      type: 'error',
      duration: 8000, // Longer duration for errors
    });
  }, [storeAddToast]);

  // Helper for creating standardized warning toasts
  const showWarning = useCallback((title, description) => {
    return storeAddToast({
      title,
      description,
      type: 'warning',
      duration: 6000,
    });
  }, [storeAddToast]);

  // Helper for creating standardized info toasts
  const showInfo = useCallback((title, description) => {
    return storeAddToast({
      title,
      description,
      type: 'info',
      duration: 5000,
    });
  }, [storeAddToast]);

  return {
    toasts,
    showToast: storeAddToast, // Original function
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
