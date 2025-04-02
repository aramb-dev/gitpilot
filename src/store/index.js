/**
 * GitPilot Store
 *
 * Main store setup and export file for GitPilot application
 * Uses Zustand for state management as specified in the project requirements
 */

import { useAuthStore } from './authStore';
import { useUserStore } from './userStore';
import { useUiStore } from './uiStore';

// Export all stores for easy access throughout the application
export {
  useAuthStore,
  useUserStore,
  useUiStore
};

// Helper for persisting state to localStorage if needed
export const persistState = (key, value) => {
  try {
    if (value === undefined) return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error persisting state for key "${key}":`, error);
  }
};

// Helper for retrieving persisted state from localStorage
export const getPersistedState = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving persisted state for key "${key}":`, error);
    return defaultValue;
  }
};
