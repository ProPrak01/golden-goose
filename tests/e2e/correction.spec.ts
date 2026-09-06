import { expect, test } from '@playwright/test';

test('offers a correction path for an active memory', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Correct memory' }).first().click();
  await expect(
    page.getByRole('heading', { name: 'Replace a memory without erasing its history.' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save correction' })).toBeVisible();
});
