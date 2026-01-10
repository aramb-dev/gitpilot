import { describe, expect, it } from 'bun:test';
import { normalizeAccount } from './account';
import type { GitHubUserProfile } from '@/types/account';

const createMockGitHubProfile = (overrides: Partial<GitHubUserProfile> = {}): GitHubUserProfile => ({
  id: 12345,
  login: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345',
  html_url: 'https://github.com/testuser',
  bio: 'A test user',
  company: 'Test Corp',
  location: 'Test City',
  public_repos: 10,
  total_private_repos: 5,
  owned_private_repos: 3,
  plan: {
    name: 'pro',
    space: 976562499,
    collaborators: 0,
    private_repos: 9999,
  },
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2024-01-15T12:00:00Z',
  ...overrides,
});

describe('normalizeAccount', () => {
  it('maps identity fields correctly', () => {
    const raw = createMockGitHubProfile({
      id: 99999,
      login: 'myuser',
      name: 'My User',
      email: 'my@email.com',
    });

    const result = normalizeAccount(raw);

    expect(result.id).toBe(99999);
    expect(result.login).toBe('myuser');
    expect(result.name).toBe('My User');
    expect(result.email).toBe('my@email.com');
  });

  it('maps avatar and profile URLs', () => {
    const raw = createMockGitHubProfile({
      avatar_url: 'https://example.com/avatar.png',
      html_url: 'https://github.com/example',
    });

    const result = normalizeAccount(raw);

    expect(result.avatarUrl).toBe('https://example.com/avatar.png');
    expect(result.profileUrl).toBe('https://github.com/example');
  });

  it('maps repo counts correctly', () => {
    const raw = createMockGitHubProfile({
      public_repos: 25,
      total_private_repos: 10,
    });

    const result = normalizeAccount(raw);

    expect(result.publicRepos).toBe(25);
    expect(result.privateRepos).toBe(10);
  });

  it('falls back to owned_private_repos when total_private_repos is missing', () => {
    const raw = createMockGitHubProfile({
      public_repos: 25,
      owned_private_repos: 7,
    });
    delete (raw as any).total_private_repos;

    const result = normalizeAccount(raw);

    expect(result.privateRepos).toBe(7);
  });

  it('defaults privateRepos to 0 when both counts are missing', () => {
    const raw = createMockGitHubProfile();
    delete (raw as any).total_private_repos;
    delete (raw as any).owned_private_repos;

    const result = normalizeAccount(raw);

    expect(result.privateRepos).toBe(0);
  });

  it('maps metadata fields', () => {
    const raw = createMockGitHubProfile({
      bio: 'My bio',
      company: 'My Company',
      location: 'My Location',
    });

    const result = normalizeAccount(raw);

    expect(result.bio).toBe('My bio');
    expect(result.company).toBe('My Company');
    expect(result.location).toBe('My Location');
  });

  it('handles null metadata fields', () => {
    const raw = createMockGitHubProfile({
      bio: null,
      company: null,
      location: null,
    });

    const result = normalizeAccount(raw);

    expect(result.bio).toBeNull();
    expect(result.company).toBeNull();
    expect(result.location).toBeNull();
  });

  it('extracts plan name', () => {
    const raw = createMockGitHubProfile({
      plan: { name: 'enterprise', space: 0, collaborators: 0, private_repos: 0 },
    });

    const result = normalizeAccount(raw);

    expect(result.plan).toBe('enterprise');
  });

  it('handles missing plan', () => {
    const raw = createMockGitHubProfile();
    delete (raw as any).plan;

    const result = normalizeAccount(raw);

    expect(result.plan).toBeNull();
  });

  it('maps timestamps directly', () => {
    const raw = createMockGitHubProfile({
      created_at: '2019-06-15T10:30:00Z',
      updated_at: '2024-01-20T08:00:00Z',
    });

    const result = normalizeAccount(raw);

    expect(result.createdAt).toBe('2019-06-15T10:30:00Z');
    expect(result.updatedAt).toBe('2024-01-20T08:00:00Z');
  });
});
