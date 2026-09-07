import { expect, test } from '@playwright/test';

test('shows the Hey Kivi workspace', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'What deserves your attention today?' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ask Kivi →' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Capture memory' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open decision history' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What Kivi can currently use.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'No longer relevant' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Correct memory' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete memory' }).first()).toBeVisible();
  await page.getByLabel('Your question').fill('What should I do today? Tell me the next action.');
  const response = page.waitForResponse('**/api/hey-kivi');
  await page.getByRole('button', { name: 'Ask Kivi →' }).click();
  await expect((await response).ok()).toBeTruthy();
  await expect(page.getByText('Based on the explicit memory')).toBeVisible();
});
