import { expect, test } from '@playwright/test';

test('shows an inspectable record of memory decisions', async ({ page }) => {
  await page.goto('/history');
  await expect(
    page.getByRole('heading', { name: 'Every retained detail has a reason.' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /recent decisions/ })).toBeVisible();
  await expect(page.getByText('Decision provider').first()).toBeVisible();
});
