import { expect, test } from '@playwright/test';

test('landing page has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/GitPilot/);
});

test('login button is present', async ({ page }) => {
  await page.goto('/');

  // Find the login button
  const loginButton = page.getByRole('button', { name: /GITHUB_LOGIN/i });
  await expect(loginButton).toBeVisible();
});
