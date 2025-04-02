/**
 * GitPilot Validation Utilities
 * Input validation functions used throughout the application
 */

import { PLANS } from './constants';

/**
 * Validates a GitHub Personal Access Token format (not checking if it works)
 * @param {string} token - GitHub token to validate
 * @returns {boolean} - Whether the token format is valid
 */
export const isValidGitHubTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  // GitHub tokens are 40 characters for classic PATs, newer fine-grained tokens may be different
  return /^gh[a-zA-Z0-9_]+$/.test(token) || /^[a-zA-Z0-9]{40}$/.test(token);
};

/**
 * Validates if a repository operation is allowed based on user's plan
 * @param {string} operation - Operation type
 * @param {Object} repository - Repository object
 * @param {Object} userPlan - User's plan details
 * @returns {Object} - { isAllowed: boolean, message: string }
 */
export const validateRepositoryOperation = (operation, repository, userPlan) => {
  // Default to FREE plan if none provided
  const plan = userPlan || PLANS.FREE;

  // Check organization repository access for free tier
  if (
    repository.owner.type === 'Organization' &&
    !plan.orgReposAccess
  ) {
    return {
      isAllowed: false,
      message: 'Organization repository management requires a Pro plan. Please upgrade to continue.'
    };
  }

  // Check specific operation permissions
  switch (operation) {
    case 'delete':
      // Additional validation for delete operation
      if (!repository.permissions?.admin) {
        return {
          isAllowed: false,
          message: 'You need admin permissions to delete this repository.'
        };
      }
      break;
    case 'changeVisibility':
      // Additional validation for visibility change
      if (!repository.permissions?.admin) {
        return {
          isAllowed: false,
          message: 'You need admin permissions to change visibility of this repository.'
        };
      }
      break;
    case 'archive':
      // Additional validation for archive operation
      if (!repository.permissions?.admin) {
        return {
          isAllowed: false,
          message: 'You need admin permissions to archive/unarchive this repository.'
        };
      }
      break;
    default:
      // For any other operations
      if (!repository.permissions?.push) {
        return {
          isAllowed: false,
          message: 'You need push permissions to perform this operation.'
        };
      }
  }

  return { isAllowed: true, message: '' };
};

/**
 * Validates a bulk operation based on repositories count and user's plan
 * @param {Array} repositories - Array of repositories to perform operation on
 * @param {Object} userPlan - User's plan details
 * @returns {Object} - { isAllowed: boolean, message: string }
 */
export const validateBulkOperation = (repositories, userPlan) => {
  // Default to FREE plan if none provided
  const plan = userPlan || PLANS.FREE;

  // Check number of repositories
  if (repositories.length > plan.maxReposPerOperation) {
    return {
      isAllowed: false,
      message: `Your plan allows a maximum of ${plan.maxReposPerOperation} repositories per operation. Please upgrade or select fewer repositories.`
    };
  }

  // Check if any operations are on organization repositories for free tier
  if (!plan.orgReposAccess) {
    const hasOrgRepos = repositories.some(repo => repo.owner.type === 'Organization');
    if (hasOrgRepos) {
      return {
        isAllowed: false,
        message: 'Your selection includes organization repositories which requires a Pro plan. Please upgrade or remove organization repositories.'
      };
    }
  }

  return { isAllowed: true, message: '' };
};

/**
 * Validates a repository name format
 * @param {string} name - Repository name to validate
 * @returns {boolean} - Whether the name format is valid
 */
export const isValidRepositoryName = (name) => {
  if (!name || typeof name !== 'string') return false;
  // GitHub repository naming rules
  return /^[a-zA-Z0-9_.-]+$/.test(name) && name.length <= 100;
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates if all required repository parameters are present for an update
 * @param {Object} updateParams - Parameters to update
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateRepositoryUpdateParams = (updateParams) => {
  if (!updateParams || typeof updateParams !== 'object') {
    return {
      isValid: false,
      message: 'Update parameters must be an object'
    };
  }

  // If updating name, check format
  if (updateParams.name && !isValidRepositoryName(updateParams.name)) {
    return {
      isValid: false,
      message: 'Repository name can only contain letters, numbers, hyphens, underscores, and periods'
    };
  }

  // Visibility must be either 'public' or 'private'
  if (
    updateParams.private !== undefined &&
    typeof updateParams.private !== 'boolean'
  ) {
    return {
      isValid: false,
      message: 'Visibility must be a boolean value'
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates repository search query
 * @param {string} query - Search query
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateSearchQuery = (query) => {
  if (!query) {
    return { isValid: true, message: '' }; // Empty query is valid
  }

  if (query.length < 3) {
    return {
      isValid: false,
      message: 'Search query must be at least 3 characters'
    };
  }

  return { isValid: true, message: '' };
};

export default {
  isValidGitHubTokenFormat,
  validateRepositoryOperation,
  validateBulkOperation,
  isValidRepositoryName,
  isValidEmail,
  validateRepositoryUpdateParams,
  validateSearchQuery
};
