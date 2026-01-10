/**
 * Organization access status detection utilities.
 */

import type { OrganizationAccess, OrgAccessStatus } from '@/types/account';
import { createGitHubHeaders } from './client';

const MAX_CONCURRENT_STATUS_CHECKS = 5;

interface GitHubOrg {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
}

/**
 * Detects the access status for a single organization.
 * @param accessToken - GitHub OAuth access token
 * @param org - Organization basic info
 * @returns OrganizationAccess with status
 */
export async function detectOrgAccessStatus(
  accessToken: string,
  org: GitHubOrg
): Promise<OrganizationAccess> {
  const headers = createGitHubHeaders(accessToken);
  const baseAccess: Omit<OrganizationAccess, 'status' | 'statusMessage'> = {
    id: org.id,
    login: org.login,
    avatarUrl: org.avatar_url,
    description: org.description,
  };

  try {
    // Try to fetch org repos to verify full access
    const response = await fetch(
      `https://api.github.com/orgs/${encodeURIComponent(org.login)}/repos?per_page=1`,
      { headers, cache: 'no-store' }
    );

    if (response.ok) {
      // Try to get membership info for role
      const membershipRes = await fetch(
        `https://api.github.com/user/memberships/orgs/${encodeURIComponent(org.login)}`,
        { headers, cache: 'no-store' }
      );

      let role: OrganizationAccess['role'];
      if (membershipRes.ok) {
        const membership = await membershipRes.json();
        role = membership.role as OrganizationAccess['role'];
      }

      return {
        ...baseAccess,
        status: 'accessible',
        statusMessage: null,
        role,
      };
    }

    // Parse error to determine status
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || '';

    if (message.includes('SAML') || message.includes('SSO')) {
      return {
        ...baseAccess,
        status: 'sso_required',
        statusMessage: 'SSO authorization required. Please authorize GitPilot for this organization.',
      };
    }

    if (message.includes('OAuth App access restrictions')) {
      return {
        ...baseAccess,
        status: 'oauth_restricted',
        statusMessage: 'This organization restricts third-party OAuth app access.',
      };
    }

    return {
      ...baseAccess,
      status: 'unknown',
      statusMessage: `Access check failed: ${response.status}`,
    };
  } catch (error) {
    return {
      ...baseAccess,
      status: 'unknown',
      statusMessage: error instanceof Error ? error.message : 'Failed to check access',
    };
  }
}

/**
 * Detects access status for multiple organizations.
 * Processes in batches to avoid rate limit issues.
 * @param accessToken - GitHub OAuth access token
 * @param orgs - Array of organization basic info
 * @returns Array of OrganizationAccess with statuses
 */
export async function detectAllOrgStatuses(
  accessToken: string,
  orgs: GitHubOrg[]
): Promise<OrganizationAccess[]> {
  const results: OrganizationAccess[] = [];

  // Process in batches
  for (let i = 0; i < orgs.length; i += MAX_CONCURRENT_STATUS_CHECKS) {
    const batch = orgs.slice(i, i + MAX_CONCURRENT_STATUS_CHECKS);
    const batchResults = await Promise.all(
      batch.map((org) => detectOrgAccessStatus(accessToken, org))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Gets a human-readable label for an org access status.
 */
export function getStatusLabel(status: OrgAccessStatus): string {
  switch (status) {
    case 'accessible':
      return 'Accessible';
    case 'sso_required':
      return 'SSO Required';
    case 'oauth_restricted':
      return 'Restricted';
    case 'unknown':
      return 'Unknown';
  }
}

/**
 * Gets a color class for an org access status badge.
 */
export function getStatusColor(status: OrgAccessStatus): string {
  switch (status) {
    case 'accessible':
      return 'bg-green-900/20 text-green-400 border-green-800/50';
    case 'sso_required':
      return 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50';
    case 'oauth_restricted':
      return 'bg-red-900/20 text-red-400 border-red-800/50';
    case 'unknown':
      return 'bg-gray-900/20 text-gray-400 border-gray-800/50';
  }
}
