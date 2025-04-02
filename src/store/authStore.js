import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../services/auth';
import {
  signInWithGitHub,
  signOut,
  getCurrentUser
} from '../services/auth';

/**
 * Authentication Store
 *
 * Manages authentication state for the GitPilot application
 * Handles GitHub OAuth authentication as specified in the project requirements
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      loading: true,
      error: null,
      githubToken: null,
      githubUser: null,

      // Initialize the auth state
      initialize: async () => {
        set({ loading: true, error: null });
        try {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            set({
              user: {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
              },
              loading: false
            });
            // Load GitHub token if available
            get().loadGitHubData();
          } else {
            set({ user: null, loading: false });
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
          set({
            user: null,
            loading: false,
            error: error.message
          });
        }
      },

      // Sign in with GitHub OAuth
      signInWithGitHub: async () => {
        set({ loading: true, error: null });
        try {
          const result = await signInWithGitHub();
          set({
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
            },
            githubToken: result.githubToken,
            loading: false
          });
          return result;
        } catch (error) {
          console.error("Error signing in with GitHub:", error);
          set({
            loading: false,
            error: error.message
          });
          throw error;
        }
      },

      // Sign out
      signOut: async () => {
        set({ loading: true, error: null });
        try {
          await signOut();
          set({
            user: null,
            githubToken: null,
            githubUser: null,
            loading: false
          });
        } catch (error) {
          console.error("Error signing out:", error);
          set({
            loading: false,
            error: error.message
          });
          throw error;
        }
      },

      // Set user manually (used by Firebase auth state listener)
      setUser: (user) => {
        set({ user });
        if (user) {
          get().loadGitHubData();
        }
      },

      // Set loading state
      setLoading: (loading) => set({ loading }),

      // Set error state
      setError: (error) => set({ error }),

      // Set GitHub token
      setGitHubToken: (token) => {
        set({ githubToken: token });
      },

      // Set GitHub user data
      setGitHubUser: (user) => {
        set({ githubUser: user });
      },

      // Load GitHub related data
      loadGitHubData: async () => {
        // This would be implemented to fetch GitHub token and user data from Firebase
        // Implementation would depend on the specific Firebase structure
      },

      // Check if user has specific GitHub permissions
      hasGitHubScope: (scope) => {
        const { githubToken } = get();
        if (!githubToken || !githubToken.scope) return false;
        return githubToken.scope.split(',').includes(scope);
      }
    }),
    {
      name: "gitpilot-auth-storage",
      partialize: (state) => ({
        user: state.user,
        githubToken: state.githubToken,
        githubUser: state.githubUser
      })
    }
  )
);

// Initialize auth state when the store is first imported
useAuthStore.getState().initialize();
