/**
 * GitPilot Application Constants
 * Centralized constants used throughout the application
 */

// GitHub API Endpoints and Configuration
export const GITHUB_API = {
    BASE_URL: 'https://api.github.com',
    ENDPOINTS: {
      USER: '/user',
      USER_REPOS: '/user/repos',
      USER_ORGS: '/user/orgs',
      ORG_REPOS: (org) => `/orgs/${org}/repos`,
      REPO: (owner, repo) => `/repos/${owner}/${repo}`,
      SEARCH_REPOS: '/search/repositories'
    },
    SCOPES: 'user:email,repo,delete_repo,admin:org',
    DEFAULT_PAGE_SIZE: 100, // Max allowed by GitHub API
  };

  // Authentication Constants
  export const AUTH = {
    GITHUB_OAUTH_URL: 'https://github.com/login/oauth/authorize',
    GITHUB_TOKEN_URL: 'https://github.com/login/oauth/access_token',
    LOCAL_STORAGE_KEYS: {
      AUTH_TOKEN: 'gitpilot_auth_token',
      USER_INFO: 'gitpilot_user_info',
      GITHUB_TOKEN: 'gitpilot_github_token',
    },
  };

  // Application Routes
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    SETTINGS: '/settings',
    BILLING: '/billing',
    AUTH_CALLBACK: '/auth/callback',
    NOT_FOUND: '*',
  };

  // UI Constants
  export const UI = {
    REPOSITORIES_PER_PAGE: 20,
    BATCH_SIZE: {
      DEFAULT: 10,
      MAX: 50,
    },
    ANIMATION_DURATION: 300, // ms
    TOAST_DURATION: 5000, // ms
  };

  // Plan Limitations
  export const PLANS = {
    FREE: {
      name: 'Free',
      maxBatchSize: 10,
      orgReposAccess: false,
      maxReposPerOperation: 50,
      features: ['Personal repositories', 'Basic filtering', 'Standard support'],
    },
    PRO: {
      name: 'Pro',
      maxBatchSize: 50,
      orgReposAccess: true,
      maxReposPerOperation: 500,
      features: ['Organization repositories', 'Advanced filtering', 'Priority support', 'Unlimited operations'],
    },
  };

  // Repository Operations
  export const OPERATIONS = {
    CHANGE_VISIBILITY: 'change_visibility',
    DELETE: 'delete',
    ARCHIVE: 'archive',
    TRANSFER: 'transfer',
    UPDATE_SETTINGS: 'update_settings',
  };

  // Error Messages
  export const ERRORS = {
    GENERAL: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    AUTHENTICATION: 'Authentication failed. Please sign in again.',
    PERMISSION: 'You don\'t have permission to perform this action.',
    RATE_LIMIT: 'GitHub API rate limit exceeded. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
  };

  // Feature Flags
  export const FEATURES = {
    ENABLE_BATCH_DELETE: true,
    ENABLE_VISIBILITY_CHANGE: true,
    ENABLE_ARCHIVE_UNARCHIVE: true,
    ENABLE_TRANSFER: false, // Not available in MVP
    ENABLE_ORG_MANAGEMENT: true,
  };

  export default {
    GITHUB_API,
    AUTH,
    ROUTES,
    UI,
    PLANS,
    OPERATIONS,
    ERRORS,
    FEATURES,
  };
