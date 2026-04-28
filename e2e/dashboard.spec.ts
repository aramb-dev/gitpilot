import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    // Console logging
    page.on('console', (_msg) => {});
    page.on('pageerror', (_err) => {});

    // Set bypass header for all requests in this context
    await context.setExtraHTTPHeaders({
      'x-e2e-bypass-auth': 'true',
    });

    // Mock the session
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Test User',
            email: 'test@example.com',
            image: 'https://github.com/octocat.png',
            id: '12345',
          },
          expires: '2026-01-01T00:00:00.000Z',
          accessToken: 'dummy-token',
          scopes: ['repo', 'read:org', 'delete_repo'],
        }),
      });
    });

    // Mock preferences
    await page.route('**/api/preferences', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: '12345',
          selectedOrgs: ['acme-org'],
          itemsPerPage: 30,
          theme: 'dark',
          defaultBranch: 'main',
          defaultVisibility: 'all',
          showArchived: false,
          showForks: true,
        }),
      });
    });

    // Mock GitHub user info
    await page.route('**/api/github/account', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          login: 'testuser',
          avatarUrl: 'https://github.com/octocat.png',
        }),
      });
    });

    // Mock GitHub repositories
    await page.route('**/api/github/repos*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              name: 'repo-1',
              full_name: 'testuser/repo-1',
              owner: 'testuser',
              owner_type: 'User',
              description: 'Description 1',
              html_url: 'https://github.com/testuser/repo-1',
              visibility: 'public',
              archived: false,
              disabled: false,
              fork: false,
              stars: 10,
              forks: 2,
              open_issues: 0,
              language: 'TypeScript',
              default_branch: 'main',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              pushed_at: '2024-01-01T00:00:00Z',
              clone_url: 'https://github.com/testuser/repo-1.git',
              permissions: { admin: true, push: true, pull: true },
            },
            {
              id: 2,
              name: 'repo-2',
              full_name: 'testuser/repo-2',
              owner: 'testuser',
              owner_type: 'User',
              description: 'Description 2',
              html_url: 'https://github.com/testuser/repo-2',
              visibility: 'private',
              archived: false,
              disabled: false,
              fork: false,
              stars: 5,
              forks: 0,
              open_issues: 0,
              language: 'JavaScript',
              default_branch: 'main',
              created_at: '2024-01-02T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
              pushed_at: '2024-01-02T00:00:00Z',
              clone_url: 'https://github.com/testuser/repo-2.git',
              permissions: { admin: true, push: true, pull: true },
            },
          ],
        }),
      });
    });
  });

  test('should navigate to dashboard and show repositories', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Check if we are on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Wait for loading to finish
    await expect(page.getByText(/loading/i)).not.toBeVisible();

    // Check if repositories are displayed
    await expect(page.getByRole('link', { name: 'repo-1' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'repo-2' })).toBeVisible();
  });

  test('should filter repositories', async ({ page }) => {
    await page.goto('/dashboard/repos', { waitUntil: 'networkidle' });

    // Wait for loading to finish
    await expect(page.getByText(/loading/i)).not.toBeVisible();

    await expect(page.getByRole('link', { name: 'repo-1' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'repo-2' })).toBeVisible();

    // Type in search box
    const searchInput = page.getByPlaceholder(/search\.\.\./i);
    await searchInput.fill('repo-1');

    // repo-2 should disappear (filtered in UI)
    await expect(page.getByRole('link', { name: 'repo-2' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'repo-1' })).toBeVisible();
  });

  test('should select multiple repositories and show bulk action bar', async ({ page }) => {
    await page.goto('/dashboard/repos', { waitUntil: 'networkidle' });

    // Wait for repos to load
    await expect(page.getByText(/loading/i)).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'repo-1' })).toBeVisible();

    // Select first repo
    // In our mockup/component it's a role="checkbox"
    const checkboxes = page.getByRole('checkbox');
    await checkboxes.first().click();

    // Bulk action buttons should be enabled
    const deleteButton = page.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeEnabled();

    // Select second repo
    await checkboxes.nth(1).click();
    await expect(deleteButton).toBeEnabled();
  });
});
