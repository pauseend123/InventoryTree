import { expect, test } from './baseFixtures.js';
import { baseUrl } from './defaults.js';
import { doQuickLogin } from './login.js';

test('PUI - Parts', async ({ page }) => {
  await doQuickLogin(page);

  await page.goto(`${baseUrl}/home`);
  await page.getByRole('tab', { name: 'Parts' }).click();

  await page.waitForURL('**/platform/part/category/index/details');
  await page.goto(`${baseUrl}/part/category/index/parts`);
  await page.getByText('1551ABK').click();
  await page.getByRole('tab', { name: 'Allocations' }).click();
  await page.getByRole('tab', { name: 'Used In' }).click();
  await page.getByRole('tab', { name: 'Pricing' }).click();
  await page.getByRole('tab', { name: 'Manufacturers' }).click();
  await page.getByRole('tab', { name: 'Suppliers' }).click();
  await page.getByRole('tab', { name: 'Purchase Orders' }).click();
  await page.getByRole('tab', { name: 'Scheduling' }).click();
  await page.getByRole('tab', { name: 'Stocktake' }).click();
  await page.getByRole('tab', { name: 'Attachments' }).click();
  await page.getByRole('tab', { name: 'Notes' }).click();
  await page.getByRole('tab', { name: 'Related Parts' }).click();

  // Related Parts
  await page.getByText('1551ACLR').click();
  await page.getByRole('tab', { name: 'Part Details' }).click();
  await page.getByRole('tab', { name: 'Parameters' }).click();
  // await page.getByRole('tab', { name: 'Stock' }).click();
  await page.getByRole('tab', { name: 'Allocations' }).click();
  await page.getByRole('tab', { name: 'Used In' }).click();
  await page.getByRole('tab', { name: 'Pricing' }).click();
});

test('PUI - Parts - Manufacturer Parts', async ({ page }) => {
  await doQuickLogin(page);

  await page.goto(`${baseUrl}/part/84/manufacturers`);

  await page.getByRole('tab', { name: 'Manufacturers' }).click();
  await page.getByText('Hammond Manufacturing').click();
  await page.getByRole('tab', { name: 'Parameters' }).click();
  await page.getByRole('tab', { name: 'Suppliers' }).click();
  await page.getByRole('tab', { name: 'Attachments' }).click();
  await page.getByText('1551ACLR - 1551ACLR').waitFor();
});

test('PUI - Parts - Supplier Parts', async ({ page }) => {
  await doQuickLogin(page);

  await page.goto(`${baseUrl}/part/15/suppliers`);

  await page.getByRole('tab', { name: 'Suppliers' }).click();
  await page.getByRole('cell', { name: 'DIG-84670-SJI' }).click();
  await page.getByRole('tab', { name: 'Received Stock' }).click(); //
  await page.getByRole('tab', { name: 'Purchase Orders' }).click();
  await page.getByRole('tab', { name: 'Pricing' }).click();
  await page.getByText('DIG-84670-SJI - R_550R_0805_1%').waitFor();
});

test('PUI - Sales', async ({ page }) => {
  await doQuickLogin(page);

  await page.goto(`${baseUrl}/sales/`);

  await page.waitForURL('**/platform/sales/**');
  await page.waitForURL('**/platform/sales/index/salesorders');
  await page.getByRole('tab', { name: 'Return Orders' }).click();

  // Customers
  await page.getByRole('tab', { name: 'Customers' }).click();
  await page.getByText('Customer A').click();
  await page.getByRole('tab', { name: 'Notes' }).click();
  await page.getByRole('tab', { name: 'Attachments' }).click();
  await page.getByRole('tab', { name: 'Contacts' }).click();
  await page.getByRole('tab', { name: 'Assigned Stock' }).click();
  await page.getByRole('tab', { name: 'Return Orders' }).click();
  await page.getByRole('tab', { name: 'Sales Orders' }).click();
  await page.getByRole('tab', { name: 'Contacts' }).click();
  await page.getByRole('cell', { name: 'Dorathy Gross' }).waitFor();
  await page
    .getByRole('row', { name: 'Dorathy Gross 	dorathy.gross@customer.com' })
    .waitFor();

  // Sales Order Details
  await page.getByRole('tab', { name: 'Sales Orders' }).click();
  await page.getByRole('cell', { name: 'SO0001' }).click();
  await page
    .getByLabel('Order Details')
    .getByText('Selling some stuff')
    .waitFor();
  await page.getByRole('tab', { name: 'Line Items' }).click();
  await page.getByRole('tab', { name: 'Pending Shipments' }).click();
  await page.getByRole('tab', { name: 'Completed Shipments' }).click();
  await page.getByRole('tab', { name: 'Build Orders' }).click();
  await page.getByText('No records found').first().waitFor();
  await page.getByRole('tab', { name: 'Attachments' }).click();
  await page.getByText('No attachments found').first().waitFor();
  await page.getByRole('tab', { name: 'Notes' }).click();
  await page.getByRole('tab', { name: 'Order Details' }).click();

  // Return Order Details
  await page.getByRole('link', { name: 'Customer A' }).click();
  await page.getByRole('tab', { name: 'Return Orders' }).click();
  await page.getByRole('cell', { name: 'RMA-' }).click();
  await page.getByText('RMA-0001', { exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Line Items' }).click();
  await page.getByRole('tab', { name: 'Attachments' }).click();
  await page.getByRole('tab', { name: 'Notes' }).click();
});

test('PUI - Scanning', async ({ page }) => {
  await doQuickLogin(page);

  await page.getByLabel('Homenav').click();
  await page.getByRole('button', { name: 'System Information' }).click();
  await page.locator('button').filter({ hasText: 'Dismiss' }).click();
  await page.getByRole('link', { name: 'Scanning' }).click();
  await page.waitForTimeout(200);

  await page.locator('.mantine-Overlay-root').click();
  await page.getByPlaceholder('Select input method').click();
  await page.getByRole('option', { name: 'Manual input' }).click();
  await page.getByPlaceholder('Enter item serial or data').click();
  await page.getByPlaceholder('Enter item serial or data').fill('123');
  await page.getByPlaceholder('Enter item serial or data').press('Enter');
  await page.getByRole('cell', { name: 'manually' }).click();
  await page.getByRole('button', { name: 'Lookup part' }).click();
  await page.getByPlaceholder('Select input method').click();
  await page.getByRole('option', { name: 'Manual input' }).click();
});

test('PUI - Admin', async ({ page }) => {
  // Note here we login with admin access
  await doQuickLogin(page, 'admin', 'inventree');

  // User settings
  await page.getByRole('button', { name: 'admin' }).click();
  await page.getByRole('menuitem', { name: 'Account settings' }).click();
  await page.getByRole('tab', { name: 'Security' }).click();
  //await page.getByRole('tab', { name: 'Dashboard' }).click();
  await page.getByRole('tab', { name: 'Display Options' }).click();
  await page.getByText('Date Format').waitFor();
  await page.getByRole('tab', { name: 'Search' }).click();
  await page.getByText('Regex Search').waitFor();
  await page.getByRole('tab', { name: 'Notifications' }).click();
  await page.getByRole('tab', { name: 'Reporting' }).click();
  await page.getByText('Inline report display').waitFor();

  // System Settings
  await page.getByRole('link', { name: 'Switch to System Setting' }).click();
  await page.getByText('Base URL', { exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Login' }).click();
  await page.getByRole('tab', { name: 'Barcodes' }).click();
  await page.getByRole('tab', { name: 'Notifications' }).click();
  await page.getByRole('tab', { name: 'Pricing' }).click();
  await page.getByRole('tab', { name: 'Labels' }).click();
  await page.getByRole('tab', { name: 'Reporting' }).click();
  await page.getByRole('tab', { name: 'Part Categories' }).click();
  //wait page.locator('#mantine-9hqbwrml8-tab-parts').click();
  //await page.locator('#mantine-9hqbwrml8-tab-stock').click();
  await page.getByRole('tab', { name: 'Stocktake' }).click();
  await page.getByRole('tab', { name: 'Build Orders' }).click();
  await page.getByRole('tab', { name: 'Purchase Orders' }).click();
  await page.getByRole('tab', { name: 'Sales Orders' }).click();
  await page.getByRole('tab', { name: 'Return Orders' }).click();

  // Admin Center
  await page.getByRole('button', { name: 'admin' }).click();
  await page.getByRole('menuitem', { name: 'Admin Center' }).click();
  await page.getByRole('tab', { name: 'Background Tasks' }).click();
  await page.getByRole('tab', { name: 'Error Reports' }).click();
  await page.getByRole('tab', { name: 'Currencies' }).click();
  await page.getByRole('tab', { name: 'Project Codes' }).click();
  await page.getByRole('tab', { name: 'Custom Units' }).click();
  await page.getByRole('tab', { name: 'Part Parameters' }).click();
  await page.getByRole('tab', { name: 'Category Parameters' }).click();
  await page.getByRole('tab', { name: 'Templates' }).click();
  await page.getByRole('tab', { name: 'Plugins' }).click();
  await page.getByRole('tab', { name: 'Machines' }).click();
});

test('PUI - Language / Color', async ({ page }) => {
  await doQuickLogin(page);

  await page.getByRole('button', { name: 'Ally Access' }).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  await page.getByRole('button', { name: 'Send me an email' }).click();
  await page.getByRole('button').nth(3).click();
  await page.getByLabel('Select language').click();
  await page.getByRole('option', { name: 'German' }).click();
  await page.waitForTimeout(200);

  await page.getByRole('button', { name: 'Benutzername und Passwort' }).click();
  await page.getByPlaceholder('Ihr Benutzername').click();
  await page.getByPlaceholder('Ihr Benutzername').fill('admin');
  await page.getByPlaceholder('Ihr Benutzername').press('Tab');
  await page.getByPlaceholder('Dein Passwort').fill('inventree');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await page.waitForTimeout(200);

  await page
    .locator('span')
    .filter({ hasText: 'AnzeigeneinstellungenFarbmodusSprache' })
    .getByRole('button')
    .click();
  await page
    .locator('span')
    .filter({ hasText: 'AnzeigeneinstellungenFarbmodusSprache' })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: "InvenTree's Logo" }).first().click();
  await page.getByRole('tab', { name: 'Dashboard' }).click();
  await page.waitForURL('**/platform/dashboard');
});

test('PUI - Company', async ({ page }) => {
  await doQuickLogin(page);

  await page.goto(`${baseUrl}/company/1/details`);
  await page
    .locator('div')
    .filter({ hasText: /^DigiKey Electronics$/ })
    .waitFor();
  await page.getByRole('cell', { name: 'https://www.digikey.com/' }).waitFor();
  await page.getByRole('tab', { name: 'Supplied Parts' }).click();
  await page
    .getByRole('cell', { name: 'RR05P100KDTR-ND', exact: true })
    .waitFor();
  await page.getByRole('tab', { name: 'Purchase Orders' }).click();
  await page.getByRole('cell', { name: 'Molex connectors' }).first().waitFor();
  await page.getByRole('tab', { name: 'Stock Items' }).click();
  await page.getByRole('cell', { name: 'Blue plastic enclosure' }).waitFor();
  await page.getByRole('tab', { name: 'Contacts' }).click();
  await page.getByRole('cell', { name: 'jimmy.mcleod@digikey.com' }).waitFor();
  await page.getByRole('tab', { name: 'Addresses' }).click();
  await page.getByRole('cell', { name: 'Carla Tunnel' }).waitFor();
  await page.getByRole('tab', { name: 'Attachments' }).click();
  await page.getByRole('tab', { name: 'Notes' }).click();
});
