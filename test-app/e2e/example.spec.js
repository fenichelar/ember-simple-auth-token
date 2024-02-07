// @ts-check
const { test, expect } = require('@playwright/test');

test('Renders page in fastboot mode', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Dummy/);
  await expect(page.locator('h2')).toHaveText('Welcome to Ember');
});
