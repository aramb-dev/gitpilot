/**
 * Account and organization access types for GitPilot.
 */

/**
 * Raw GitHub user profile from /user endpoint.
 */
export interface GitHubUserProfile {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  public_repos: number;
  total_private_repos?: number;
  owned_private_repos?: number;
  plan?: {
    name: string;
    space: number;
    collaborators: number;
    private_repos: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Normalized account model for GitPilot.
 */
export interface Account {
  // Identity
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
  profileUrl: string;

  // Stats
  publicRepos: number;
  privateRepos: number;

  // Metadata
  bio: string | null;
  company: string | null;
  location: string | null;

  // Plan info
  plan: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Organization access status.
 */
export type OrgAccessStatus = 
  | 'accessible'
  | 'sso_required'
  | 'oauth_restricted'
  | 'unknown';

/**
 * Organization with access status information.
 */
export interface OrganizationAccess {
  id: number;
  login: string;
  avatarUrl: string;
  description: string | null;

  // Access status
  status: OrgAccessStatus;
  statusMessage: string | null;

  // Permissions (if accessible)
  role?: 'admin' | 'member' | 'billing_manager';
  canCreateRepos?: boolean;
}

/**
 * Token verification response.
 */
export interface TokenVerificationResult {
  valid: boolean;
  user?: {
    id: number;
    login: string;
    avatarUrl: string;
  };
  scopes?: string[];
  rateLimitRemaining?: number;
  error?: {
    code: 'TOKEN_REVOKED' | 'TOKEN_EXPIRED' | 'NETWORK_ERROR';
    message: string;
  };
}

/**
 * OAuth scope descriptions for display.
 */
export const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'read:user': 'Read your profile information',
  'user:email': 'Access your email addresses',
  'repo': 'Full access to repositories (required for private repos)',
  'public_repo': 'Access public repositories only',
  'read:org': 'Read organization membership',
  'write:org': 'Write organization membership',
  'admin:org': 'Full control of organizations',
  'delete_repo': 'Delete repositories',
  'gist': 'Create and manage gists',
};
