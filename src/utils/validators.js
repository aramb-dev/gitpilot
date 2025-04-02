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

  // Check if any operations are on organi