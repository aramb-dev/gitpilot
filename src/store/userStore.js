import { create } from 'zustand';
import { fetchUserRepositories, fetchUserOrganizations } from '../services/github';

/**
 * User Store
 *
 * Manages user-related data for the GitPilot application
 * Handles GitHub repositories, organizations, and other user-specific data
 */
export const useUserStore = create((set, get) => ({
  // Repositories
  repositories: [],
  filteredRepositories: [],
  repositoriesLoading: false,
  repositoriesError: null,

  // Organizations
  organizations: [],
  organizationsLoading: false,
  organizationsError: null,

  // Selected items for bulk operations
  selectedRepositories: [],

  // Filters
  filters: {
    visibility: 'all', // 'all', 'public', 'private'
    owner: 'all', // 'all', 'user', specific org name
    type: 'all', // 'all', 'sources', 'forks', 'archived'
    search: '',
  },

  // Pagination
  pagination: {
    page: 1,
    perPage: 20,
    hasMore: false,
  },

  // Fetch user repositories
  fetchRepositories: async (force = false) => {
    const { repositories, repositoriesLoading } = get();

    // Don't fetch if we're already loading or if we have repos and aren't forcing a refresh
    if (repositoriesLoading || (repositories.length > 0 && !force)) return;

    set({ repositoriesLoading: true, repositoriesError: null });

    try {
      const repos = await fetchUserRepositories();
      set({
        repositories: repos,
        repositoriesLoading: false,
      });
      // Apply filters after fetching
      get().applyFilters();
    } catch (error) {
      console.error("Error fetching repositories:", error);
      set({
        repositoriesLoading: false,
        repositoriesError: error.message
      });
    }
  },

  // Fetch user organizations
  fetchOrganizations: async (force = false) => {
    const { organizations, organizationsLoading } = get();

    // Don't fetch if we're already loading or if we have orgs and aren't forcing a refresh
    if (organizationsLoading || (organizations.length > 0 && !force)) return;

    set({ organizationsLoading: true, organizationsError: null });

    try {
      const orgs = await fetchUserOrganizations();
      set({
        organizations: orgs,
        organizationsLoading: false,
      });
    } catch (error) {
      console.error("Error fetching organizations:", error);
      set({
        organizationsLoading: false,
        organizationsError: error.message
      });
    }
  },

  // Select or deselect a repository
  toggleRepositorySelection: (repoId) => {
    const { selectedRepositories } = get();
    if (selectedRepositories.includes(repoId)) {
      set({
        selectedRepositories: selectedRepositories.filter(id => id !== repoId)
      });
    } else {
      set({
        selectedRepositories: [...selectedRepositories, repoId]
      });
    }
  },

  // Select all repositories (optionally filtered)
  selectAllRepositories: () => {
    const { filteredRepositories } = get();
    set({
      selectedRepositories: filteredRepositories.map(repo => repo.id)
    });
  },

  // Deselect all repositories
  clearSelection: () => {
    set({ selectedRepositories: [] });
  },

  // Apply filters to repositories
  applyFilters: () => {
    const { repositories, filters } = get();
    let filtered = [...repositories];

    // Filter by visibility
    if (filters.visibility !== 'all') {
      const isPrivate = filters.visibility === 'private';
      filtered = filtered.filter(repo => repo.private === isPrivate);
    }

    // Filter by owner
    if (filters.owner !== 'all') {
      if (filters.owner === 'user') {
        filtered = filtered.filter(repo => repo.owner.type === 'User');
      } else {
        filtered = filtered.filter(repo => repo.owner.login === filters.owner);
      }
    }

    // Filter by type
    if (filters.type !== 'all') {
      switch (filters.type) {
        case 'sources':
          filtered = filtered.filter(repo => !repo.fork);
          break;
        case 'forks':
          filtered = filtered.filter(repo => repo.fork);
          break;
        case 'archived':
          filtered = filtered.filter(repo => repo.archived);
          break;
        default:
          break;
      }
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(searchLower) ||
        (repo.description && repo.description.toLowerCase().includes(searchLower))
      );
    }

    set({ filteredRepositories: filtered });
  },

  // Update filters
  setFilter: (key, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    }));
    get().applyFilters();
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        visibility: 'all',
        owner: 'all',
        type: 'all',
        search: '',
      }
    });
    get().applyFilters();
  },

  // Pagination controls
  nextPage: () => {
    set(state => ({
      pagination: {
        ...state.pagination,
        page: state.pagination.page + 1
      }
    }));
  },

  prevPage: () => {
    set(state => ({
      pagination: {
        ...state.pagination,
        page: Math.max(1, state.pagination.page - 1)
      }
    }));
  },

  setPerPage: (perPage) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        perPage,
        page: 1 // Reset to first page when changing items per page
      }
    }));
  }
}));
