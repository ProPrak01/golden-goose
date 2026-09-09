import { expect, test } from '@playwright/test';

test('reviews a transcript memory proposal before it can be saved', async ({ page }) => {
  await page.goto('/capture');
  await expect(
    page.getByRole('heading', { name: 'Review what Kivi remembers before it is saved.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Ask Sarvam for explicit memories' }),
  ).toBeVisible();
  const proposalResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/memory-proposals') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Review proposal' }).click();
  expect((await proposalResponse).ok()).toBeTruthy();
  await expect(
    page.getByText('Explicit evidence meets the memory confidence threshold.'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save approved memory' })).toBeVisible();
});

test('keeps an incognito capture out of Kivi memory', async ({ page }) => {
  await page.goto('/capture');
  await page.getByLabel('Incognito — do not retain this').check();
  await page.getByRole('button', { name: 'Keep private' }).click();
  await expect(page.getByText('Incognito is on. This statement stays in this form')).toBeVisible();
});
