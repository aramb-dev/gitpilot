/**
 * GitHub account normalization utilities.
 */

import type { Account, GitHubUserProfile } from '@/types/account';

/**
 * Normalizes a raw GitHub user profile to the Account domain model.
 * @param raw - Raw GitHub API user profile response
 * @returns Normalized Account object
 */
export function normalizeAccount(raw: GitHubUserProfile): Account {
  return {
    // Identity
    id: raw.id,
    login: raw.login,
    name: raw.name,
    email: raw.email,
    avatarUrl: raw.avatar_url,
    profileUrl: raw.html_url,

    // Stats
    publicRepos: raw.public_repos,
    privateRepos: raw.total_private_repos ?? raw.owned_private_repos ?? 0,

    // Metadata
    bio: raw.bio,
    company: raw.company,
    location: raw.location,

    // Plan info
    plan: raw.plan?.name ?? null,

    // Timestamps
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}
