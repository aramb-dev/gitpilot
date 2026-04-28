import { afterEach, describe, expect, it, mock } from 'bun:test';
import {
  detectAllOrgStatuses,
  detectOrgAccessStatus,
  getStatusColor,
  getStatusLabel,
} from './org-status';

const mockOrg = {
  id: 1,
  login: 'test-org',
  avatar_url: 'https://avatars.githubusercontent.com/u/1',
  description: 'Test Organization',
};

describe('detectOrgAccessStatus', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns accessible status when repos can be fetched', async () => {
    global.fetch = mock((url: string) => {
      if (url.includes('/repos')) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }
      if (url.includes('/memberships')) {
        return Promise.resolve(new Response(JSON.stringify({ role: 'admin' }), { status: 200 }));
      }
      return Promise.resolve(new Response('{}', { status: 200 }));
    }) as any;

    const result = await detectOrgAccessStatus('token', mockOrg);

    expect(result.status).toBe('accessible');
    expect(result.statusMessage).toBeNull();
    expect(result.role).toBe('admin');
  });

  it('returns sso_required when SAML error is returned', async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            message: 'Resource protected by organization SAML enforcement',
          }),
          { status: 403 },
        ),
      ),
    ) as any;

    const result = await detectOrgAccessStatus('token', mockOrg);

    expect(result.status).toBe('sso_required');
    expect(result.statusMessage).toContain('SSO');
  });

  it('returns oauth_restricted when OAuth restriction error is returned', async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            message: 'Organization has enabled OAuth App access restrictions',
          }),
          { status: 403 },
        ),
      ),
    ) as any;

    const result = await detectOrgAccessStatus('token', mockOrg);

    expect(result.status).toBe('oauth_restricted');
    expect(result.statusMessage).toContain('restricts');
  });

  it('returns unknown status on other errors', async () => {
    global.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 })),
    ) as any;

    const result = await detectOrgAccessStatus('token', mockOrg);

    expect(result.status).toBe('unknown');
  });

  it('returns unknown status on network error', async () => {
    global.fetch = mock(() => Promise.reject(new Error('Network failed'))) as any;

    const result = await detectOrgAccessStatus('token', mockOrg);

    expect(result.status).toBe('unknown');
    expect(result.statusMessage).toContain('Network failed');
  });

  it('preserves org info in result', async () => {
    global.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify([]), { status: 200 })),
    ) as any;

    const result = await detectOrgAccessStatus('token', mockOrg);

    expect(result.id).toBe(mockOrg.id);
    expect(result.login).toBe(mockOrg.login);
    expect(result.avatarUrl).toBe(mockOrg.avatar_url);
    expect(result.description).toBe(mockOrg.description);
  });
});

describe('detectAllOrgStatuses', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('processes multiple orgs', async () => {
    global.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify([]), { status: 200 })),
    ) as any;

    const orgs = [
      { ...mockOrg, id: 1, login: 'org1' },
      { ...mockOrg, id: 2, login: 'org2' },
      { ...mockOrg, id: 3, login: 'org3' },
    ];

    const results = await detectAllOrgStatuses('token', orgs);

    expect(results).toHaveLength(3);
    expect(results[0].login).toBe('org1');
    expect(results[1].login).toBe('org2');
    expect(results[2].login).toBe('org3');
  });

  it('handles empty org list', async () => {
    const results = await detectAllOrgStatuses('token', []);
    expect(results).toEqual([]);
  });
});

describe('getStatusLabel', () => {
  it('returns correct labels', () => {
    expect(getStatusLabel('accessible')).toBe('Accessible');
    expect(getStatusLabel('sso_required')).toBe('SSO Required');
    expect(getStatusLabel('oauth_restricted')).toBe('Restricted');
    expect(getStatusLabel('unknown')).toBe('Unknown');
  });
});

describe('getStatusColor', () => {
  it('returns green for accessible', () => {
    expect(getStatusColor('accessible')).toContain('green');
  });

  it('returns yellow for sso_required', () => {
    expect(getStatusColor('sso_required')).toContain('yellow');
  });

  it('returns red for oauth_restricted', () => {
    expect(getStatusColor('oauth_restricted')).toContain('red');
  });

  it('returns gray for unknown', () => {
    expect(getStatusColor('unknown')).toContain('gray');
  });
});
