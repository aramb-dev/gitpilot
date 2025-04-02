import { create } from 'zustand';

/**
 * UI Store
 *
 * Manages UI state for the GitPilot application
 * Handles modals, loading states, toasts, and other UI-related state
 */
export const useUiStore = create((set, get) => ({
  // Sidebar state
  sidebarOpen: true,

  // Modal states
  modals: {
    bulkVisibility: false,
    bulkDelete: false,
    confirmAction: false,
    settings: false,
  },

  // Modal data for dynamic modals
  modalData: null,

  // Toast notifications
  toasts: [],

  // Active operation data (for tracking ongoing operations)
  activeOperation: null,

  // Operation results
  operationResults: null,

  // Theme
  theme: 'light', // 'light' or 'dark'

  // Toggle sidebar
  toggleSidebar: () => {
    set(state => ({ sidebarOpen: !state.sidebarOpen }));
  },

  // Open modal
  openModal: (modalName, data = null) => {
    set(state => ({
      modals: {
        ...state.modals,
        [modalName]: true
      },
      modalData: data
    }));
  },

  // Close modal
  closeModal: (modalName) => {
    set(state => ({
      modals: {
        ...state.modals,
        [modalName]: false
      }
    }));
  },

  // Close all modals
  closeAllModals: () => {
    set({
      modals: Object.keys(get().modals).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {}),
      modalData: null
    });
  },

  // Add toast
  addToast: (toast) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      duration: 5000, // Default duration
      ...toast
    };

    set(state => ({
      toasts: [...state.toasts, newToast]
    }));

    // Auto-remove toast after duration
    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);

    return id;
  },

  // Remove toast
  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  // Clear all toasts
  clearToasts: () => {
    set({ toasts: [] });
  },

  // Set active operation
  setActiveOperation: (operation) => {
    set({
      activeOperation: operation,
      operationResults: null
    });
  },

  // Clear active operation
  clearActiveOperation: () => {
    set({ activeOperation: null });
  },

  // Set operation results
  setOperationResults: (results) => {
    set({ operationResults: results });
  },

  // Clear operation results
  clearOperationResults: () => {
    set({ operationResults: null });
  },

  // Toggle theme
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });

    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save preference
    localStorage.setItem('gitpilot-theme', newTheme);
  },

  // Set specific theme
  setTheme: (theme) => {
    set({ theme });

    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save preference
    localStorage.setItem('gitpilot-theme', theme);
  },

  // Initialize theme from saved preference
  initTheme: () => {
    const savedTheme = localStorage.getItem('gitpilot-theme');
    if (savedTheme) {
      get().setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference as fallback
      get().setTheme('dark');
    }
  }
}));

// Initialize theme when store is first imported
useUiStore.getState().initTheme();
