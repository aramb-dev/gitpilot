import { describe, expect, it } from 'bun:test';
import { normalizeRepository, normalizeRepositories } from './normalize';
import type { GitHubRepository } from '@/types/github';

const createMockGitHubRepo = (overrides: Partial<GitHubRepository> = {}): GitHubRepository => ({
  id: 1,
  name: 'test-repo',
  full_name: 'user/test-repo',
  owner: {
    login: 'user',
    id: 100,
    type: 'User',
    avatar_url: 'https://avatars.githubusercontent.com/u/100',
  },
  private: false,
  html_url: 'https://github.com/user/test-repo',
  description: 'A test repository',
  fork: false,
  url: 'https://api.github.com/repos/user/test-repo',
  archive_url: 'https://api.github.com/repos/user/test-repo/{archive_format}{/ref}',
  archived: false,
  disabled: false,
  visibility: 'public',
  pushed_at: '2024-01-15T10:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T12:00:00Z',
  clone_url: 'https://github.com/user/test-repo.git',
  ssh_url: 'git@github.com:user/test-repo.git',
  language: 'TypeScript',
  forks_count: 5,
  stargazers_count: 10,
  watchers_count: 10,
  open_issues_count: 3,
  default_branch: 'main',
  has_issues: true,
  has_projects: true,
  has_wiki: true,
  has_pages: false,
  has_downloads: true,
  is_template: false,
  license: null,
  size: 1024,
  ...overrides,
});

describe('normalizeRepository', () => {
  it('maps id, name, full_name directly', () => {
    const raw = createMockGitHubRepo({
      id: 12345,
      name: 'my-repo',
      full_name: 'owner/my-repo',
    });

    const result = normalizeRepository(raw);

    expect(result.id).toBe(12345);
    expect(result.name).toBe('my-repo');
    expect(result.full_name).toBe('owner/my-repo');
  });

  it('maps owner.login to owner', () => {
    const raw = createMockGitHubRepo({
      owner: { login: 'testuser', id: 1, type: 'User', avatar_url: '' },
    });

    const result = normalizeRepository(raw);

    expect(result.owner).toBe('testuser');
  });

  it('maps owner.type to owner_type for User', () => {
    const raw = createMockGitHubRepo({
      owner: { login: 'user', id: 1, type: 'User', avatar_url: '' },
    });

    const result = normalizeRepository(raw);

    expect(result.owner_type).toBe('User');
  });

  it('maps owner.type to owner_type for Organization', () => {
    const raw = createMockGitHubRepo({
      owner: { login: 'org', id: 1, type: 'Organization', avatar_url: '' },
    });

    const result = normalizeRepository(raw);

    expect(result.owner_type).toBe('Organization');
  });

  it('maps private: true to visibility: private', () => {
    const raw = createMockGitHubRepo({ private: true });

    const result = normalizeRepository(raw);

    expect(result.visibility).toBe('private');
  });

  it('maps private: false to visibility: public', () => {
    const raw = createMockGitHubRepo({ private: false });

    const result = normalizeRepository(raw);

    expect(result.visibility).toBe('public');
  });

  it('maps archived and disabled directly', () => {
    const raw = createMockGitHubRepo({ archived: true, disabled: true });

    const result = normalizeRepository(raw);

    expect(result.archived).toBe(true);
    expect(result.disabled).toBe(true);
  });

  it('maps description, language, default_branch directly', () => {
    const raw = createMockGitHubRepo({
      description: 'My description',
      language: 'JavaScript',
      default_branch: 'develop',
    });

    const result = normalizeRepository(raw);

    expect(result.description).toBe('My description');
    expect(result.language).toBe('JavaScript');
    expect(result.default_branch).toBe('develop');
  });

  it('handles null description and language', () => {
    const raw = createMockGitHubRepo({
      description: null,
      language: null,
    });

    const result = normalizeRepository(raw);

    expect(result.description).toBeNull();
    expect(result.language).toBeNull();
  });

  it('maps stargazers_count to stars', () => {
    const raw = createMockGitHubRepo({ stargazers_count: 100 });

    const result = normalizeRepository(raw);

    expect(result.stars).toBe(100);
  });

  it('maps forks_count to forks', () => {
    const raw = createMockGitHubRepo({ forks_count: 50 });

    const result = normalizeRepository(raw);

    expect(result.forks).toBe(50);
  });

  it('maps open_issues_count to open_issues', () => {
    const raw = createMockGitHubRepo({ open_issues_count: 25 });

    const result = normalizeRepository(raw);

    expect(result.open_issues).toBe(25);
  });

  it('maps timestamps directly', () => {
    const raw = createMockGitHubRepo({
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
      pushed_at: '2024-01-15T10:00:00Z',
    });

    const result = normalizeRepository(raw);

    expect(result.created_at).toBe('2024-01-01T00:00:00Z');
    expect(result.updated_at).toBe('2024-01-15T12:00:00Z');
    expect(result.pushed_at).toBe('2024-01-15T10:00:00Z');
  });

  it('handles null pushed_at', () => {
    const raw = createMockGitHubRepo({ pushed_at: null });

    const result = normalizeRepository(raw);

    expect(result.pushed_at).toBeNull();
  });

  it('maps html_url and clone_url directly', () => {
    const raw = createMockGitHubRepo({
      html_url: 'https://github.com/user/repo',
      clone_url: 'https://github.com/user/repo.git',
    });

    const result = normalizeRepository(raw);

    expect(result.html_url).toBe('https://github.com/user/repo');
    expect(result.clone_url).toBe('https://github.com/user/repo.git');
  });

  it('maps permissions object when present', () => {
    const raw = createMockGitHubRepo({
      permissions: { admin: true, push: true, pull: true },
    });

    const result = normalizeRepository(raw);

    expect(result.permissions).toEqual({
      admin: true,
      push: true,
      pull: true,
    });
  });

  it('uses default permissions when missing', () => {
    const raw = createMockGitHubRepo();
    delete (raw as any).permissions;

    const result = normalizeRepository(raw);

    expect(result.permissions).toEqual({
      admin: false,
      push: false,
      pull: true,
    });
  });

  it('handles permissions with only some fields true', () => {
    const raw = createMockGitHubRepo({
      permissions: { admin: false, push: true, pull: true },
    });

    const result = normalizeRepository(raw);

    expect(result.permissions.admin).toBe(false);
    expect(result.permissions.push).toBe(true);
    expect(result.permissions.pull).toBe(true);
  });
});

describe('normalizeRepositories', () => {
  it('normalizes array of repositories', () => {
    const raw = [
      createMockGitHubRepo({ id: 1, name: 'repo1' }),
      createMockGitHubRepo({ id: 2, name: 'repo2' }),
    ];

    const result = normalizeRepositories(raw);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBeDefined();
    expect(result[1].name).toBeDefined();
  });

  it('deduplicates by id', () => {
    const raw = [
      createMockGitHubRepo({ id: 1, name: 'repo1' }),
      createMockGitHubRepo({ id: 1, name: 'repo1-duplicate' }),
      createMockGitHubRepo({ id: 2, name: 'repo2' }),
    ];

    const result = normalizeRepositories(raw);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual([1, 2]);
  });

  it('keeps first occurrence when deduplicating', () => {
    const raw = [
      createMockGitHubRepo({ id: 1, name: 'first', updated_at: '2024-01-15T12:00:00Z' }),
      createMockGitHubRepo({ id: 1, name: 'second', updated_at: '2024-01-15T12:00:00Z' }),
    ];

    const result = normalizeRepositories(raw);

    expect(result[0].name).toBe('first');
  });

  it('sorts by updated_at descending', () => {
    const raw = [
      createMockGitHubRepo({ id: 1, name: 'oldest', updated_at: '2024-01-01T00:00:00Z' }),
      createMockGitHubRepo({ id: 2, name: 'newest', updated_at: '2024-01-15T00:00:00Z' }),
      createMockGitHubRepo({ id: 3, name: 'middle', updated_at: '2024-01-10T00:00:00Z' }),
    ];

    const result = normalizeRepositories(raw);

    expect(result[0].name).toBe('newest');
    expect(result[1].name).toBe('middle');
    expect(result[2].name).toBe('oldest');
  });

  it('handles empty array', () => {
    const result = normalizeRepositories([]);

    expect(result).toEqual([]);
  });

  it('handles single item', () => {
    const raw = [createMockGitHubRepo({ id: 1, name: 'only' })];

    const result = normalizeRepositories(raw);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('only');
  });
});
