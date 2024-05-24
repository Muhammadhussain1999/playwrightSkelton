import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import { selectTaxonomies } from "helpers/listTaxonomies";

//Promo Codes CI Admin Test
const role = roles.admin;
const name = "dd test";
const promo_code = "DDPROMOTEST";

/* Create Promo Code with: 
    - percentage off 
    - no minimum spend 
    - immediate redemption 
    - no statis discount 
    - no limitations on customer redemption
    - unlimited total redemptions
    - unlimited user/customer promo code redemption 
    - promo codee valid for all taxonomies
    - no limit to maximum number of taxonomies   
    - no activation restrictions 
*/
test.use({ storageState: role.path });
test("Test Promo Code List Loads", async ({ page }) => {
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Promo Codes" }).click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/list") && response.status() === 200,
  );
});
test("Happy Path to Create a Promo Code 1", async ({ page }) => {
  const date = Date.now();
  const promo_1 = `${promo_code}${date}`;
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Promo Codes" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  //fill in all fields listed above
  await page.getByLabel("Name *").click();
  await page.getByLabel("Name *").fill(name);
  await page.getByLabel("Promo Code *").click();
  await page.getByLabel("Promo Code *").fill(promo_1);
  await page
    .locator('[data-cy="datadesk-promo-code-discount-percent"] input')
    .check();
  await page.getByLabel("Percentage").fill("10");
  await page.getByLabel("No, there is no minimum spend").check();
  await page.getByLabel("Immediately").check();
  await page
    .getByLabel(
      "No limitations, all users from any customer can redeem the promo code",
    )
    .check();
  await page
    .locator("div")
    .filter({ hasText: /^UnlimitedLimited Quantity of$/ })
    .getByLabel("Unlimited")
    .check();
  await page
    .getByTestId("redemption_quantity_limit_per_entity_restricted_by")
    .getByLabel("Open")
    .click();
  await page.getByRole("option", { name: "User" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^UnlimitedLimited Quantity ofSelect$/ })
    .getByLabel("Unlimited")
    .check();
  await page
    .locator("div")
    .filter({ hasText: /^UnlimitedLimited Quantity ofSelect$/ })
    .getByLabel("Unlimited")
    .check();
  await page
    .getByLabel("No, the promo code is valid for all taxonomies")
    .check();
  await page
    .getByLabel("No, there is no limitation on the number of taxonomies")
    .check();
  await page
    .getByLabel("No, the promo code applies to all activation channels")
    .check();
  await page.getByRole("button", { name: "Create" }).click();
  //if create response is 200 it was a success
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/create") && response.status() === 200,
  );
  await expect(page.getByText(promo_1)).toBeVisible();
  const row = page.getByRole("checkbox", { name: promo_1 });

  //check view functionality
  await row.locator("#view").click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/get") && response.status() === 200,
  );
  await expect(await page.getByText(promo_1).nth(0)).toHaveText(promo_1);
  // check edit functionality
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(await page.getByText("Edit Promo Code")).toBeVisible();
  await page.getByLabel("Name *").click();
  await page.getByLabel("Name *").fill("2");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/edit") && response.status() === 200,
  );
  await expect(
    await page.getByText("Promo Code successfully updated"),
  ).toBeVisible();
  await expect(
    await page.getByTestId("pagesheet-body-root").getByText("Promo Codes"),
  ).toBeVisible();

  //check archive functionality
  await row.locator("#archive").click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/archive") &&
      response.status() === 200,
  );

  //check delete functionality
  await row.locator("#delete").click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/delete") && response.status() === 200,
  );
});

/* Create Promo Code to test these specific selections: 
    - specific redemption date
    - custom CPM
    - yes minimum spend of $20
    - Dynamic Discount duration days after confirmation 1, remains on order for 2 days 
    - Limit customers to two customers 
    - limited redemption quantity, unlimted customers
    - limited promo code to specific data partners 
    - limit promo code to maximum of taxonomies 
    - yes limit promo code to an activation channel 
*/
test("Happy Path to Create a Promo Code 2", async ({ page }) => {
  const date = Date.now();
  const promo = `${promo_code}${date}`;
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Promo Codes" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Name *").click();
  await page.getByLabel("Name *").fill(name);
  await page.getByLabel("Promo Code *").click();
  await page.getByLabel("Promo Code *").fill(promo);
  //choose a random date from the date selector
  await page.getByLabel("Choose date").nth(0).click();
  await page.getByLabel("next month").click();
  await page.getByText("18").nth(0).click();
  await page.waitForTimeout(300);
  await page.getByLabel("Choose date").nth(1).click();
  await page.getByLabel("next month").click();
  await page.getByLabel("next month").click();
  await page.getByText("16").nth(0).click();
  await page.waitForTimeout(300);
  await page.getByLabel("Custom CPM").click();
  await page.getByLabel("Custom CPM").fill("2");
  await page.waitForTimeout(300);
  await page
    .getByLabel(
      "Yes, the discount will only be applied to the following month if the previous months spend exceeds",
    )
    .check();
  await page.locator("#minimum_spend").fill("100");
  await page.getByLabel("Days after order confirmation").check();
  await page.getByTestId("start_date_after").getByLabel("Select").click();
  await page.getByRole("option", { name: "3", exact: true }).click();
  await page.getByLabel("Selectdays").click();
  await page.getByRole("option", { name: "3", exact: true }).click();
  await page
    .getByLabel("Limit which customers can redeem the promo code")
    .check();
  await page.getByLabel("Select customers").click();
  await page.getByRole("option").nth(3).click();
  await page.getByText("Limited Quantity of").first().click();
  await page.locator("#redemption_quantity_limit").fill("100");
  await page
    .getByTestId("redemption_quantity_limit_per_entity_restricted_by")
    .getByLabel("Open")
    .click();
  await page.getByRole("option", { name: "Customer" }).click();
  await page
    .getByText("Yes, limit the promo code to specific data partners")
    .click();
  await page.getByTestId("data_partner_ids").getByLabel("Select").click();
  await page.getByRole("option").nth(3).click();
  await page.getByText("Yes limit the order to a maximum of").click();
  await page.getByTestId("maximum_taxonomies").getByLabel("Select");
  await page
    .getByTestId("maximum_taxonomies")
    .locator("div")
    .filter({ hasText: "Select" })
    .click();
  await page.getByRole("option").nth(3).click();
  await page
    .getByText("Yes, limit the promo code to the specified activation channels")
    .click();
  await page.getByTestId("dsps_ids").getByLabel("Select").click();
  await page.getByRole("option").nth(3).click();
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/create") && response.status() === 200,
  );
  await expect(await page.getByText(promo)).toBeVisible();
  //check delete functionality
  const row = page.getByRole("checkbox", { name: promo });
  await row.locator("#delete").click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/delete") && response.status() === 200,
  );
});

/* Create Promo Code to test these specific selections: 
    - customer redemption restrictions on users 
    - static discount duration (choose dates)
    - a user can redeem the promo code for a limited quantity
    - limit the promo code to specific categories 
*/
test("Happy Path to Create a Promo Code 3", async ({ page }) => {
  const date = Date.now();
  const promo_1 = `${promo_code}${date}`;
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Promo Codes" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Name *").click();
  await page.getByLabel("Name *").fill(name);
  await page.getByLabel("Promo Code *").click();
  await page.getByLabel("Promo Code *").fill(promo_1);
  await page.getByLabel("Custom CPM").click();
  await page.getByLabel("Custom CPM").fill("2");
  await page.getByLabel("No, there is no minimum spend").check();
  await page
    .getByLabel(
      "The discount should be activated and deactivated on specific dates",
    )
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Activation Date$/ })
    .getByRole("button", { name: /^Choose date/ })
    .click();

  await page
    .getByRole("dialog", { name: "Activation Date" })
    .getByRole("row")
    .nth(3)
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Deactivation Date$/ })
    .getByRole("button", { name: /^Choose date/ })
    .click();
  await page
    .getByRole("dialog", { name: "Deactivation Date" })
    .getByLabel("next month")
    .click();
  await page.getByRole("row").nth(3).click();

  await page.getByLabel("Limit which users can redeem the promo code").click();
  await page.getByLabel("Select Users").click();
  // @todo uncomment code bellow once issue is fixed
  // await page.getByRole('option').nth(3).click();
  // await page
  //   .locator('div')
  //   .filter({ hasText: /^UnlimitedLimited Quantity of$/ })
  //   .getByLabel('Unlimited')
  //   .check();
  // await page
  //   .getByTestId('redemption_quantity_limit_per_entity_restricted_by')
  //   .getByLabel('Open')
  //   .click();
  // await page.getByRole('option', { name: 'customer' }).click();
  // await page
  //   .locator('div')
  //   .filter({ hasText: /^Limited Quantity ofSelect$/ })
  //   .getByLabel('Limited Quantity of')
  //   .click();
  // await page.getByTestId('redemption_quantity_limit_per_entity').getByLabel('Select').click();
  // await page.getByRole('option').nth(3).click();

  // await page.getByLabel('No, the promo code is valid for all taxonomies').check();
  // await page.getByLabel('No, there is no limitation on the number of taxonomies').check();
  // await page.getByLabel('No, the promo code applies to all activation channels').check();
  // await page.getByRole('button', { name: 'Create' }).click();
  // await page.waitForResponse(
  //   (response) => response.url().includes('PromoCodes/create') && response.status() === 200,
  // );
  // @todo uncomment code bellow once issue is fixed
  // await expect(await page.getByText(promo_1)).toBeVisible();
  // //check delete functionality
  // const row = page.getByRole('checkbox', { name: promo_1 });
  // await row.locator('#delete').click();
  // await page.waitForResponse(
  //   (response) => response.url().includes('PromoCodes/delete') && response.status() === 200,
  // );
});

/* Create Promo Code to test these specific selections: 
    - limit the promo code to specific sub categories 
*/
test("Happy Path to Create a Promo Code 4", async ({ page }) => {
  const date = Date.now();
  const promo_1 = `${promo_code}${date}`;
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Promo Codes" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Name *").click();
  await page.getByLabel("Name *").fill(name);
  await page.getByLabel("Promo Code *").click();
  await page.getByLabel("Promo Code *").fill(promo_1);
  await page
    .locator('[data-cy="datadesk-promo-code-discount-percent"] input')
    .check();
  await page.getByLabel("Percentage").fill("10");
  await page.getByLabel("No, there is no minimum spend").check();
  await page.getByLabel("Immediately").check();
  await page
    .getByLabel(
      "No limitations, all users from any customer can redeem the promo code",
    )
    .check();
  await page
    .locator("div")
    .filter({ hasText: /^UnlimitedLimited Quantity of$/ })
    .getByLabel("Unlimited")
    .check();
  await page
    .getByTestId("redemption_quantity_limit_per_entity_restricted_by")
    .getByLabel("Open")
    .click();
  await page.getByRole("option", { name: "User" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^UnlimitedLimited Quantity ofSelect$/ })
    .getByLabel("Unlimited")
    .check();
  await page
    .locator("div")
    .filter({ hasText: /^UnlimitedLimited Quantity ofSelect$/ })
    .getByLabel("Unlimited")
    .check();
  await page
    .getByLabel("Yes, limit the promo code to specific sub categories")
    .check();
  await page.getByTestId("sub_category_ids").getByLabel("Select").click();
  await page.getByRole("option").nth(3).click();
  await page
    .getByLabel("No, there is no limitation on the number of taxonomies")
    .check();
  await page
    .getByLabel("No, the promo code applies to all activation channels")
    .check();
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/create") && response.status() === 200,
  );

  //check delete functionality
  const row = page.getByRole("checkbox", { name: promo_1 });
  await row.locator("#delete").click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/delete") && response.status() === 200,
  );
});

/* Create Promo Code to test these specific selections: 
    - limit the promo code to specific taxonomies 
*/
test("Happy Path to Create a Promo Code 5", async ({ page }) => {
  const date = Date.now();
  const promo_1 = `${promo_code}${date}`;
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Promo Codes" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Name *").click();
  await page.getByLabel("Name *").fill(name);
  await page.getByLabel("Promo Code *").click();
  await page.getByLabel("Promo Code *").fill(promo_1);
  await page
    .locator('[data-cy="datadesk-promo-code-discount-percent"] input')
    .check();
  await page.getByLabel("Percentage").fill("10");
  await page.getByLabel("No, there is no minimum spend").check();
  await page.getByLabel("Immediately").check();
  await page
    .getByLabel(
      "No limitations, all users from any customer can redeem the promo code",
    )
    .check();
  await page
    .locator("div")
    .filter({ hasText: /^UnlimitedLimited Quantity of$/ })
    .getByLabel("Unlimited")
    .check();
  await page
    .getByTestId("redemption_quantity_limit_per_entity_restricted_by")
    .getByLabel("Open")
    .click();
  await page.getByRole("option", { name: "User" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^UnlimitedLimited Quantity ofSelect$/ })
    .getByLabel("Unlimited")
    .check();
  await page
    .locator("div")
    .filter({ hasText: /^UnlimitedLimited Quantity ofSelect$/ })
    .getByLabel("Unlimited")
    .check();
  await page
    .getByLabel("Yes, limit the promo code to specific taxonomies")
    .check();
  const _selectedTaxonomies = await selectTaxonomies(page, 2);
  await page.getByRole("checkbox").nth(7).check();
  await page
    .getByLabel("No, there is no limitation on the number of taxonomies")
    .check();
  await page
    .getByLabel("No, the promo code applies to all activation channels")
    .check();
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/create") && response.status() === 200,
  );

  //check delete functionality
  const row = page.getByRole("checkbox", { name: promo_1 });
  await row.locator("#delete").click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("PromoCodes/delete") && response.status() === 200,
  );
});

test("Create a promo code without name fails", async ({ page }) => {
  const date = Date.now();
  const promo_1 = `${promo_code}${date}`;
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Promo Codes" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Promo Code *").click();
  await page.getByLabel("Promo Code *").fill(promo_1);
  await page.getByLabel("", { exact: true }).first().check();
  await page.getByLabel("Percentage").fill("10");
  await page.getByRole("button", { name: "Create" }).click();
  //snackbar with response should appear
  await expect(page.getByText("The Name field is required.")).toBeVisible();
  //list page shouldn't load
  await expect(page.locator("#datadesk-table-toolbar")).not.toBeVisible();
});

test("Create a promo code without promo code fails", async ({ page }) => {
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Promo Codes" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Name *").click();
  await page.getByLabel("Name *").fill(name);
  //skip entering promo code
  await page.getByLabel("", { exact: true }).first().check();
  await page.getByLabel("Percentage").fill("10");
  await page.getByRole("button", { name: "Create" }).click();
  //snackbar with response should appear
  await expect(
    page.getByText("The Promo Code field is required."),
  ).toBeVisible();
  //list page shouldn't load
  await expect(page.locator("#datadesk-table-toolbar")).not.toBeVisible();
});

test("Create a promo code without cpm fails", async ({ page }) => {
  const date = Date.now();
  const promo_1 = `${promo_code}${date}`;
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Promo Codes" }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByLabel("Name *").click();
  await page.getByLabel("Name *").fill(name);
  await page.getByLabel("Promo Code *").click();
  await page.getByLabel("Promo Code *").fill(promo_1);
  //do not fill in CPM
  await page.getByRole("button", { name: "Create" }).click();
  //snackbar with response should appear
  await expect(
    await page.getByText(
      "Invalid promotional CPM price, select a percentage off or a fixed rate CPM",
    ),
  ).toBeVisible();
  //list page shouldn't load
  await expect(page.locator("#datadesk-table-toolbar")).not.toBeVisible();
});
