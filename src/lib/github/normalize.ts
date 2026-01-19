/**
 * GitHub repository data normalization utilities.
 * Transforms raw GitHub API responses into canonical domain models.
 */

import type { GitHubRepository } from '@/types/github';
import type { Repository, RepositoryPermissions, OwnerType, RepositoryVisibility } from '@/types/repository';

const DEFAULT_PERMISSIONS: RepositoryPermissions = {
  admin: false,
  push: false,
  pull: true,
};

/**
 * Normalizes a single GitHub repository to the canonical domain model.
 * @param raw - Raw GitHub API repository response
 * @returns Normalized Repository object
 */
export function normalizeRepository(raw: GitHubRepository): Repository {
  const ownerType: OwnerType = raw.owner.type === 'Organization' ? 'Organization' : 'User';
  const visibility: RepositoryVisibility = raw.private ? 'private' : 'public';

  const permissions: RepositoryPermissions = raw.permissions
    ? {
        admin: raw.permissions.admin,
        push: raw.permissions.push,
        pull: raw.permissions.pull,
      }
    : DEFAULT_PERMISSIONS;

  return {
    // Identity
    id: raw.id,
    name: raw.name,
    full_name: raw.full_name,

    // Ownership
    owner: raw.owner.login,
    owner_type: ownerType,

    // Visibility & Status
    visibility,
    archived: raw.archived,
    disabled: raw.disabled,
    fork: raw.fork,

    // Metadata
    description: raw.description,
    language: raw.language,
    default_branch: raw.default_branch,

    // Metrics
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    open_issues: raw.open_issues_count,

    // Timestamps
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    pushed_at: raw.pushed_at,

    // URLs
    html_url: raw.html_url,
    clone_url: raw.clone_url,

    // Permissions
    permissions,
  };
}

/**
 * Normalizes an array of GitHub repositories.
 * Deduplicates by ID and sorts by updated_at descending.
 * @param raw - Array of raw GitHub API repository responses
 * @returns Array of normalized, deduplicated, sorted Repository objects
 */
export function normalizeRepositories(raw: GitHubRepository[]): Repository[] {
  // Deduplicate by ID
  const seen = new Set<number>();
  const unique: GitHubRepository[] = [];

  for (const repo of raw) {
    if (!seen.has(repo.id)) {
      seen.add(repo.id);
      unique.push(repo);
    }
  }

  // Normalize
  const normalized = unique.map(normalizeRepository);

  // Sort by updated_at descending
  normalized.sort((a, b) => {
    const dateA = new Date(a.updated_at).getTime();
    const dateB = new Date(b.updated_at).getTime();
    return dateB - dateA;
  });

  return normalized;
}
