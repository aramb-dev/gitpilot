/**
 * GitHub Organization Member utilities.
 */

import { GITHUB_API_BASE, createGitHubHeaders, fetchWithBackoff } from "./client";
import { fetchAllPages } from "./pagination";
import type { GitHubUser } from "@/types/github";
import type { OrganizationMember, MemberInvitation } from "@/types/member";

/**
 * Fetches all members of an organization.
 */
export async function fetchOrgMembers(
  accessToken: string,
  org: string,
  params: { role?: 'all' | 'admin' | 'member' } = {}
): Promise<OrganizationMember[]> {
  const headers = createGitHubHeaders(accessToken);
  const role = params.role === 'all' ? undefined : params.role;
  const query = role ? `?role=${role}&per_page=100` : `?per_page=100`;
  const url = `${GITHUB_API_BASE}/orgs/${org}/members${query}`;

  const rawMembersResult = await fetchAllPages<GitHubUser & { role?: string }>(url, headers);
  const rawMembers = rawMembersResult.data;

  // Note: /orgs/{org}/members does NOT return the role in the list.
  // We need to fetch it separately or use the /orgs/{org}/memberships/{username} endpoint.
  // For bulk listing, we might just assume 'member' and let the user drill down.
  // Actually, we can fetch admins separately to mark them.

  const adminsUrl = `${GITHUB_API_BASE}/orgs/${org}/members?role=admin&per_page=100`;
  const rawAdminsResult = await fetchAllPages<GitHubUser>(adminsUrl, headers);
  const rawAdmins = rawAdminsResult.data;
  const adminLogins = new Set(rawAdmins.map((a: GitHubUser) => a.login));

  return rawMembers.map((m: GitHubUser) => ({
    id: m.id,
    login: m.login,
    avatarUrl: m.avatar_url,
    htmlUrl: m.html_url || `https://github.com/${m.login}`,
    role: adminLogins.has(m.login) ? 'admin' : 'member',
    status: 'active',
  }));
}

/**
 * Fetches pending invitations for an organization.
 */
export async function fetchOrgInvitations(
  accessToken: string,
  org: string
): Promise<MemberInvitation[]> {
  const headers = createGitHubHeaders(accessToken);
  const url = `${GITHUB_API_BASE}/orgs/${org}/invitations?per_page=100`;

  const rawInvitesResult = await fetchAllPages<any>(url, headers);
  const rawInvites = rawInvitesResult.data;

  return rawInvites.map((i: any) => ({
    id: i.id,
    login: i.login,
    email: i.email,
    role: i.role,
    createdAt: i.created_at,
    inviter: {
      login: i.inviter.login,
      avatarUrl: i.inviter.avatar_url,
    },
    teamCount: i.team_count || 0,
    invitationUrl: i.html_url,
  }));
}

/**
 * Removes a member from an organization.
 */
export async function removeOrgMember(
  accessToken: string,
  org: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  const headers = createGitHubHeaders(accessToken);
  const url = `${GITHUB_API_BASE}/orgs/${org}/members/${username}`;

  try {
    const res = await fetchWithBackoff(url, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || `Failed to remove member: ${res.statusText}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Updates a member's role in an organization.
 */
export async function updateOrgMemberRole(
  accessToken: string,
  org: string,
  username: string,
  role: 'admin' | 'member'
): Promise<{ success: boolean; error?: string }> {
  const headers = createGitHubHeaders(accessToken);
  const url = `${GITHUB_API_BASE}/orgs/${org}/memberships/${username}`;

  try {
    const res = await fetchWithBackoff(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || `Failed to update role: ${res.statusText}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
