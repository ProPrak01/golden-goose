import { expect, test } from '@playwright/test';

test('shows the semantic memory evaluation baseline', async ({ page }) => {
  await page.goto('/evaluation');
  await expect(
    page.getByRole('heading', { name: 'Evidence claims, tested as a contract.' }),
  ).toBeVisible();
  await expect(page.getByText('Cases passed')).toBeVisible();
  await expect(page.getByText('inferred-trait-rejection')).toBeVisible();
});
