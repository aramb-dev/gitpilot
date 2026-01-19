/**
 * Canonical Repository domain model for GitPilot.
 * This is the normalized shape used throughout the application.
 */

export type OwnerType = 'User' | 'Organization';

export type RepositoryVisibility = 'public' | 'private';

export interface RepositoryPermissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
}

export interface Repository {
  // Identity
  id: number;
  name: string;
  full_name: string;

  // Ownership
  owner: string;
  owner_type: OwnerType;

  // Visibility & Status
  visibility: RepositoryVisibility;
  archived: boolean;
  disabled: boolean;
  fork: boolean;

  // Metadata
  description: string | null;
  language: string | null;
  default_branch: string;

  // Metrics
  stars: number;
  forks: number;
  open_issues: number;

  // Timestamps (ISO 8601)
  created_at: string;
  updated_at: string;
  pushed_at: string | null;

  // URLs
  html_url: string;
  clone_url: string;

  // Permissions (for current user)
  permissions: RepositoryPermissions;
}
