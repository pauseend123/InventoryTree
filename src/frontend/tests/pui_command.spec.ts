import { expect, test } from './baseFixtures.js';

test('PUI - Quick Command', async ({ page }) => {
  await page.goto('./platform/');
  await expect(page).toHaveTitle('InvenTree');
  await page.waitForURL('**/platform/');
  await page.getByLabel('username').fill('allaccess');
  await page.getByLabel('password').fill('nolimits');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('**/platform');
  await page.goto('./platform/');

  await expect(page).toHaveTitle('InvenTree');
  await page.waitForURL('**/platform/');
  // wait for the page to load - 0.5s
  await page.waitForTimeout(500);

  // Open Spotlight with Keyboard Shortcut
  await page.keyboard.press('Meta+K');
  await page
    .getByRole('button', { name: 'Dashboard Go to the InvenTree dashboard' })
    .click();
  await page
    .locator('div')
    .filter({ hasText: /^Dashboard$/ })
    .click();
  await page.waitForURL('**/platform/dashboard');

  // Open Spotlight with Button
  await page.getByRole('button', { name: 'Open spotlight' }).click();
  await page.getByRole('button', { name: 'Home Go to the home page' }).click();
  await page
    .getByRole('heading', { name: 'Welcome to your Dashboard,' })
    .click();
  await page.waitForURL('**/platform');

  // Open Spotlight with Keyboard Shortcut and Search
  await page.keyboard.press('Meta+K');
  await page.getByPlaceholder('Search...').fill('Dashboard');
  await page.getByPlaceholder('Search...').press('Tab');
  await page.getByPlaceholder('Search...').press('Enter');
  await page.waitForURL('**/platform/dashboard');
});
