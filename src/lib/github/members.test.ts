/**
 * Tests for GitHub Organization Member utilities.
 * Tests cover fetching members, invitations, role detection, and bulk operations.
 */

import { describe, expect, it, mock, beforeEach } from 'bun:test';
import {
  fetchOrgMembers,
  fetchOrgInvitations,
  removeOrgMember,
  updateOrgMemberRole,
} from './members';
import type { GitHubUser } from '@/types/github';

describe('fetchOrgMembers', () => {
  const createMockGitHubUser = (overrides: Partial<GitHubUser> = {}): GitHubUser => ({
    id: 1,
    login: 'testuser',
    avatar_url: 'https://github.com/avatar.png',
    html_url: 'https://github.com/testuser',
    bio: null,
    type: 'User',
    ...overrides,
  });

  beforeEach(() => {
    mock.restore();
  });

  it('fetches and normalizes organization members', async () => {
    const mockMembers = [
      createMockGitHubUser({ id: 1, login: 'user1' }),
      createMockGitHubUser({ id: 2, login: 'user2' }),
    ];

    // First call is for all members (no Link header = no pagination)
    // Second call is for admins (no Link header = no pagination)
    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        // All members
        return Promise.resolve(new Response(
          JSON.stringify(mockMembers),
          { status: 200 }
        ));
      }
      // Admins - user1 is an admin
      return Promise.resolve(new Response(
        JSON.stringify([createMockGitHubUser({ id: 1, login: 'user1' })]),
        { status: 200 }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgMembers('test-token', 'test-org');

    expect(result).toHaveLength(2);
    expect(result[0].login).toBe('user1');
    expect(result[0].role).toBe('admin'); // user1 is in admin list
    expect(result[1].login).toBe('user2');
    expect(result[1].role).toBe('member'); // user2 is not in admin list
  });

  it('correctly identifies admin members', async () => {
    const mockMembers = [
      createMockGitHubUser({ id: 1, login: 'admin1' }),
      createMockGitHubUser({ id: 2, login: 'member1' }),
    ];

    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        // All members
        return Promise.resolve(new Response(
          JSON.stringify(mockMembers),
          { status: 200 }
        ));
      }
      // Admins - only admin1
      return Promise.resolve(new Response(
        JSON.stringify([createMockGitHubUser({ id: 1, login: 'admin1' })]),
        { status: 200 }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgMembers('test-token', 'test-org');

    expect(result[0].login).toBe('admin1');
    expect(result[0].role).toBe('admin');
    expect(result[1].login).toBe('member1');
    expect(result[1].role).toBe('member');
  });

  it('handles pagination for member list', async () => {
    const page1 = [
      createMockGitHubUser({ id: 1, login: 'user1' }),
      createMockGitHubUser({ id: 2, login: 'user2' }),
    ];
    const page2 = [
      createMockGitHubUser({ id: 3, login: 'user3' }),
    ];

    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        // First page of members - indicates more pages
        const headers = new Headers({
          'Link': '<https://api.github.com/orgs/test-org/members?per_page=100&page=2>; rel="next", <https://api.github.com/orgs/test-org/members?per_page=100&page=2>; rel="last"',
        });
        return Promise.resolve(new Response(
          JSON.stringify(page1),
          { status: 200, headers }
        ));
      } else if (callCount === 2) {
        // Second page of members
        const headers = new Headers({});
        return Promise.resolve(new Response(
          JSON.stringify(page2),
          { status: 200, headers }
        ));
      } else if (callCount <= 4) {
        // Admins pagination
        const headers = new Headers({});
        return Promise.resolve(new Response(
          JSON.stringify([]),
          { status: 200, headers }
        ));
      }
      return Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgMembers('test-token', 'test-org');

    expect(result).toHaveLength(3);
    expect(result[0].login).toBe('user1');
    expect(result[1].login).toBe('user2');
    expect(result[2].login).toBe('user3');
  });

  it('filters by admin role when specified', async () => {
    const mockMembers = [
      createMockGitHubUser({ id: 1, login: 'admin1' }),
    ];

    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        // All members (with role param in URL, but we just return admins)
        return Promise.resolve(new Response(
          JSON.stringify(mockMembers),
          { status: 200 }
        ));
      }
      // Admins for verification
      return Promise.resolve(new Response(
        JSON.stringify([createMockGitHubUser({ id: 1, login: 'admin1' })]),
        { status: 200 }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgMembers('test-token', 'test-org', { role: 'admin' });

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles null html_url in member', async () => {
    const mockMembers = [
      createMockGitHubUser({ id: 1, login: 'user1', html_url: null as any }),
    ];

    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(new Response(
          JSON.stringify(mockMembers),
          { status: 200 }
        ));
      }
      return Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgMembers('test-token', 'test-org');

    expect(result[0].login).toBe('user1');
    expect(result[0].htmlUrl).toBe('https://github.com/user1');
  });

  it('sets status to active for all members', async () => {
    const mockMembers = [
      createMockGitHubUser({ id: 1, login: 'user1' }),
    ];

    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(new Response(
          JSON.stringify(mockMembers),
          { status: 200 }
        ));
      }
      return Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgMembers('test-token', 'test-org');

    expect(result[0].status).toBe('active');
  });

  it('normalizes avatar URL correctly', async () => {
    const mockMembers = [
      createMockGitHubUser({ id: 1, login: 'user1', avatar_url: 'https://avatars.example.com/u/1' }),
    ];

    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(new Response(
          JSON.stringify(mockMembers),
          { status: 200 }
        ));
      }
      return Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200 }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgMembers('test-token', 'test-org');

    expect(result[0].avatarUrl).toBe('https://avatars.example.com/u/1');
  });
});

describe('fetchOrgInvitations', () => {
  beforeEach(() => {
    mock.restore();
  });

  it('fetches and normalizes pending invitations', async () => {
    const mockInvites = [
      {
        id: 101,
        login: 'invited_user',
        email: 'invited@example.com',
        role: 'direct_member',
        created_at: '2024-01-01T00:00:00Z',
        inviter: {
          login: 'admin',
          avatar_url: 'https://github.com/admin-avatar.png',
        },
        team_count: 2,
        html_url: 'https://github.com/orgs/test-org/invitations/101',
      },
    ];

    const mockFetch = mock(() => {
      const headers = new Headers({ 'x-total-pages': '1' });
      return Promise.resolve(new Response(
        JSON.stringify(mockInvites),
        { status: 200, headers }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgInvitations('test-token', 'test-org');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(101);
    expect(result[0].login).toBe('invited_user');
    expect(result[0].email).toBe('invited@example.com');
    expect(result[0].role).toBe('direct_member');
    expect(result[0].createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result[0].inviter.login).toBe('admin');
    expect(result[0].inviter.avatarUrl).toBe('https://github.com/admin-avatar.png');
    expect(result[0].teamCount).toBe(2);
  });

  it('handles invitations with null login (email-only invites)', async () => {
    const mockInvites = [
      {
        id: 102,
        login: null,
        email: 'email-only@example.com',
        role: 'admin',
        created_at: '2024-01-02T00:00:00Z',
        inviter: {
          login: 'admin',
          avatar_url: 'https://github.com/admin-avatar.png',
        },
        team_count: 0,
      },
    ];

    const mockFetch = mock(() => {
      const headers = new Headers({ 'x-total-pages': '1' });
      return Promise.resolve(new Response(
        JSON.stringify(mockInvites),
        { status: 200, headers }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgInvitations('test-token', 'test-org');

    expect(result).toHaveLength(1);
    expect(result[0].login).toBeNull();
    expect(result[0].email).toBe('email-only@example.com');
  });

  it('defaults team_count to 0 when missing', async () => {
    const mockInvites = [
      {
        id: 103,
        login: 'user',
        email: 'user@example.com',
        role: 'direct_member',
        created_at: '2024-01-03T00:00:00Z',
        inviter: {
          login: 'admin',
          avatar_url: 'https://github.com/admin-avatar.png',
        },
        // team_count missing
      },
    ];

    const mockFetch = mock(() => {
      const headers = new Headers({ 'x-total-pages': '1' });
      return Promise.resolve(new Response(
        JSON.stringify(mockInvites),
        { status: 200, headers }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgInvitations('test-token', 'test-org');

    expect(result[0].teamCount).toBe(0);
  });

  it('handles paginated invitations', async () => {
    const page1 = [
      {
        id: 101,
        login: 'user1',
        email: 'user1@example.com',
        role: 'direct_member',
        created_at: '2024-01-01T00:00:00Z',
        inviter: {
          login: 'admin',
          avatar_url: 'https://github.com/admin.png',
        },
        team_count: 1,
      },
    ];
    const page2 = [
      {
        id: 102,
        login: 'user2',
        email: 'user2@example.com',
        role: 'admin',
        created_at: '2024-01-02T00:00:00Z',
        inviter: {
          login: 'admin',
          avatar_url: 'https://github.com/admin.png',
        },
        team_count: 0,
      },
    ];

    let callCount = 0;
    const mockFetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        const headers = new Headers({
          'Link': '<https://api.github.com/orgs/test-org/invitations?per_page=100&page=2>; rel="next"',
        });
        return Promise.resolve(new Response(
          JSON.stringify(page1),
          { status: 200, headers }
        ));
      }
      const headers = new Headers({});
      return Promise.resolve(new Response(
        JSON.stringify(page2),
        { status: 200, headers }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgInvitations('test-token', 'test-org');

    expect(result).toHaveLength(2);
    expect(result[0].login).toBe('user1');
    expect(result[1].login).toBe('user2');
  });

  it('handles empty invitation list', async () => {
    const mockFetch = mock(() => {
      const headers = new Headers({ 'x-total-pages': '1' });
      return Promise.resolve(new Response(
        JSON.stringify([]),
        { status: 200, headers }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgInvitations('test-token', 'test-org');

    expect(result).toHaveLength(0);
  });

  it('normalizes inviter avatar URL correctly', async () => {
    const mockInvites = [
      {
        id: 104,
        login: 'user',
        email: 'user@example.com',
        role: 'direct_member',
        created_at: '2024-01-04T00:00:00Z',
        inviter: {
          login: 'inviter',
          avatar_url: 'https://custom-avatar.com/u/123',
        },
        team_count: 1,
      },
    ];

    const mockFetch = mock(() => {
      const headers = new Headers({ 'x-total-pages': '1' });
      return Promise.resolve(new Response(
        JSON.stringify(mockInvites),
        { status: 200, headers }
      ));
    }) as any;
    global.fetch = mockFetch;

    const result = await fetchOrgInvitations('test-token', 'test-org');

    expect(result[0].inviter.avatarUrl).toBe('https://custom-avatar.com/u/123');
  });
});

describe('removeOrgMember', () => {
  beforeEach(() => {
    mock.restore();
  });

  it('removes a member successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(null, { status: 204 }))
    ) as any;
    global.fetch = mockFetch;

    const result = await removeOrgMember('test-token', 'test-org', 'user-to-remove');

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns error when removal fails', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ message: 'User is not a member' }),
        { status: 404, statusText: 'Not Found' }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await removeOrgMember('test-token', 'test-org', 'nonexistent-user');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles network errors gracefully', async () => {
    const mockFetch = mock(() =>
      Promise.reject(new Error('Network error'))
    ) as any;
    global.fetch = mockFetch;

    const result = await removeOrgMember('test-token', 'test-org', 'user-to-remove');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });

  it('uses correct DELETE endpoint', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(null, { status: 204 }))
    ) as any;
    global.fetch = mockFetch;

    await removeOrgMember('test-token', 'test-org', 'user-to-remove');

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toContain('/orgs/test-org/members/user-to-remove');
    expect(callArgs[1]?.method).toBe('DELETE');
  });

  it('handles JSON parse errors gracefully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        'Invalid JSON',
        { status: 403, statusText: 'Forbidden' }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await removeOrgMember('test-token', 'test-org', 'user-to-remove');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('updateOrgMemberRole', () => {
  beforeEach(() => {
    mock.restore();
  });

  it('updates member role to admin successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ role: 'admin' }),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await updateOrgMemberRole('test-token', 'test-org', 'user1', 'admin');

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('updates member role to member successfully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ role: 'member' }),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await updateOrgMemberRole('test-token', 'test-org', 'admin1', 'member');

    expect(result.success).toBe(true);
  });

  it('returns error when update fails', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404, statusText: 'Not Found' }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await updateOrgMemberRole('test-token', 'test-org', 'nonexistent', 'admin');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles network errors gracefully', async () => {
    const mockFetch = mock(() =>
      Promise.reject(new Error('Network error'))
    ) as any;
    global.fetch = mockFetch;

    const result = await updateOrgMemberRole('test-token', 'test-org', 'user1', 'admin');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });

  it('uses correct PUT endpoint with role in body', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ role: 'admin' }),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    await updateOrgMemberRole('test-token', 'test-org', 'user1', 'admin');

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toContain('/orgs/test-org/memberships/user1');
    expect(callArgs[1]?.method).toBe('PUT');

    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.role).toBe('admin');
  });

  it('handles JSON parse errors gracefully', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        'Invalid JSON',
        { status: 403, statusText: 'Forbidden' }
      ))
    ) as any;
    global.fetch = mockFetch;

    const result = await updateOrgMemberRole('test-token', 'test-org', 'user1', 'admin');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('includes role in request body for member role', async () => {
    const mockFetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ role: 'member' }),
        { status: 200 }
      ))
    ) as any;
    global.fetch = mockFetch;

    await updateOrgMemberRole('test-token', 'test-org', 'user1', 'member');

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.role).toBe('member');
  });
});
