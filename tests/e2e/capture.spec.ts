import { expect, test } from '@playwright/test';

test('reviews a transcript memory proposal before it can be saved', async ({ page }) => {
  await page.goto('/capture');
  await expect(
    page.getByRole('heading', { name: 'Review what Kivi remembers before it is saved.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Review proposal' }).click();
  await expect(
    page.getByText('Explicit evidence meets the memory confidence threshold.'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save approved memory' })).toBeVisible();
});
