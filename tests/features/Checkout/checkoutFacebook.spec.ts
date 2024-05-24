// import { test, expect, Page } from '@playwright/test';
// import { samples as roles } from 'fixtures/configs/roles';
// import { selectTaxonomies } from 'helpers/listTaxonomies';
// import { deleteOrder } from 'helpers/orders';
// import { get_mock_user } from 'helpers/users/get';
// import { SearchPage } from 'tests/pages/SearchPage';
// import { fulfillStepTwo } from 'helpers/checkout/fulfillStepTwo';
// import { fulfillStepOne } from 'helpers/checkout/fulfillStepOne';

// Object.values(roles).map((role) => {
//   test.describe(`Checkout process for ${role.name}`, () => {
//     test.use({ storageState: role.path });
//     let orderId: undefined | number;
//     test.afterAll(async ({ browser }) => {
//       if (orderId !== undefined) {
//         await deleteOrder(browser, orderId, { storageState: roles.admin.path });
//       }
//     });
//     test(`Happy Path Checkout Test Facebook, Marketplace, USD`, async ({ page }) => {
//       const dsp = {
//         name: 'Facebook',
//       };
//       await page.route(/audiences\/edit$/, async (route) => {
//         const response = await route.fetch();
//         const json = await response.json();

//         // include the order id in the cache that will clean up later
//         if (json?.audience?.id) {
//           orderId = parseInt(json.audience.id);
//         }
//         await route.fulfill({ response, json });
//       });
//   if (role.name === 'Admin') {
//     const mock_user = await get_mock_user();
//     await page.goto('');
//     await page.getByTestId('header-user').click();
//     await page.getByLabel('Account').click();
//     await page.getByRole('menuitem', { name: 'Account' }).click();
//     await expect(page.getByLabel('my dsp configurations')).toBeVisible();
//     await page.getByLabel('my dsp configurations').click();
//   }
//   if (role.name === 'Datadesk Admin') {
//     const mock_user = await get_mock_user();
//     await page.goto('');
//     await page.getByTestId('header-user').click();
//     await page.getByRole('menuitem', { name: 'Account' }).click();
//     await page.getByTestId('dsp-tab').click();
//     await page.getByRole('button', { name: 'Add New' }).click();
//     await page.getByLabel('Configuration Name').click();
//     await page.getByLabel('Configuration Name').fill('facebook_test');
//     await page.getByPlaceholder('Select your DSP').click();
//     await page.getByRole('option', { name: 'Facebook' }).click();
//     await page.getByLabel('Business ID *').click();
//     await page.getByLabel('Business ID *').fill('12345');
//     await page.getByLabel('Account ID *').click();
//     await page.getByLabel('Account ID *').fill('12345');
//     await page.getByLabel('System User Access Token *').click();
//     await page.getByLabel('System User Access Token *').fill('12345');
//     await page.getByLabel('Billing e-mail *').click();
//     await page.getByLabel('Billing e-mail *').fill('email@email.com');
//     await page.getByTestId('datadesk-loading-spinner').click();
//     const Search = new SearchPage(page);
//     await Search.goto();
//     const selectedTaxonomies = await selectTaxonomies(page, 2);
//     await Search.goToCheckout();
//     const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
//     const StepTwoPage = await fulfillStepTwo(page, role, mock_user);

//   }
//   if (role.name === 'Datadesk User') {  }
//     });
//   });
// });
