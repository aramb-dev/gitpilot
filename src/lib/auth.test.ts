import { describe, expect, it, mock } from 'bun:test';
import { authOptions, getAuthSession } from './auth';

// Mock getServerSession
mock.module('next-auth', () => {
  let session: any = {
    user: { name: 'Test User', id: '123' },
    accessToken: 'mock-access-token',
  };
  return {
    getServerSession: () => Promise.resolve(session),
    default: () => {}, // Mock NextAuth default export
    __setSession: (s: any) => (session = s), // Helper to change mock behavior
  };
});

describe('authOptions', () => {
  it('should have the correct secret', () => {
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].id).toBe('github');
  });

  describe('callbacks', () => {
    it('should assign accessToken to token in jwt callback', async () => {
      const token = {};
      const account = {
        access_token: 'test-token',
        provider: 'github',
        type: 'oauth',
        providerAccountId: '123',
      } as any;

      const result: any = await authOptions.callbacks?.jwt?.({
        token,
        account,
        user: null as any,
        profile: undefined,
        trigger: 'signIn',
        session: null,
      });

      expect(result).toMatchObject({ accessToken: 'test-token' });
    });

    it('should persist accessToken in session callback', async () => {
      const session = { expires: '2099-01-01' } as any;
      const token = { accessToken: 'test-token' } as any;

      const result: any = await authOptions.callbacks?.session?.({
        session,
        token,
        user: null as any,
        newSession: null,
        trigger: 'update',
      });

      expect(result).toMatchObject({ accessToken: 'test-token' });
    });

    it('should include user ID in session', async () => {
      const session = { expires: '2099-01-01', user: { name: 'Test User' } } as any;
      const token = { sub: '12345' } as any;

      const result: any = await authOptions.callbacks?.session?.({
        session,
        token,
        user: null as any,
        newSession: null,
        trigger: 'update',
      });

      expect(result.user).toMatchObject({ id: '12345' });
    });
  });
});

describe('getAuthSession', () => {
  it('should return the session with access token', async () => {
    // Ensure session is set
    const { __setSession } = require('next-auth');
    __setSession({
      user: { name: 'Test User', id: '123' },
      accessToken: 'mock-access-token',
    });

    const session = await getAuthSession();
    expect(session).not.toBeNull();
    expect(session?.accessToken).toBe('mock-access-token');
    expect(session?.user?.id).toBe('123');
  });

  it('should return null if no session', async () => {
    const { __setSession } = require('next-auth');
    __setSession(null);

    const session = await getAuthSession();
    expect(session).toBeNull();
  });
});
