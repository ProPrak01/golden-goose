import { expect, test } from '@playwright/test';

test('shows the Golden Goose foundation screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Golden Goose' })).toBeVisible();
  await expect(page.getByText('Phase 0 foundation complete')).toBeVisible();
});
