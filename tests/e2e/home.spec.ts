import { expect, test } from '@playwright/test';

test('shows the Hey Kivi workspace', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'What deserves your attention today?' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ask Kivi →' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What Kivi can currently use.' })).toBeVisible();
});
