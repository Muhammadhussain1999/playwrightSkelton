import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";

const customerInfo = {
  phone: "123456789",
  email: "devtesting@connectedinteractive.com",
  country: "Canada",
  city: "Toronto",
  website: "www.connectedinteractive.com",
}

Object.values(roles).map((role) => {
  test.describe(`customers test for ${role.name}`, () => {
    test.use({ storageState: role.path });
    test(`test of customers feature for ${role.name}`, async ({ page }) => {
      if (!role.is_employee) {
        test.skip();
      }
      await page.goto("");
      await page.getByLabel("user-account").click();
      await page.getByRole("menuitem", { name: "Customers" }).click();
      await page.waitForResponse(
        (response) =>
          response.url().includes("advertisers/list") &&
          response.status() === 200,
      );
      await page.getByLabel("Search").click();
      await page.getByLabel("Search").fill("DEV TESTING");
      await page.getByLabel("Search").click();
      await page
        .getByRole("checkbox", {
          name: /DEV TESTING/,
        })
        .click();
      await page.getByTestId("customer-forward-button").click();
      await page.getByRole("tab", { name: "Users" }).click();
      await page.getByRole("tab", { name: "DSP Configurations" }).click();
      await page.getByRole("tab", { name: "Quickpick Categories" }).click();
      await page.getByRole("tab", { name: "Usage" }).click();
      await page.getByRole("tab", { name: "Admin Settings" }).click();
      await page.getByRole("tab", { name: "Orders" }).click();
      //test admin settings, changing white label customer/domain
      await page.getByRole("tab", { name: "Admin Settings" }).click();
      await page.getByTestId("admin-open-modal-button").click();
      await page.getByLabel("White Label Customer?").check();
      await page.getByLabel("White Label Domain *").click();
      await page.getByLabel("White Label Domain *").fill("test.com");
      await page.getByTestId("admin-settings-submit").click();
      await page.getByTestId("admin-open-modal-button").click();
      await page.getByLabel("White Label Customer?").uncheck();
      await page.getByLabel("White Label Domain *").dblclick();
      await page.getByLabel("White Label Domain *").fill("");
      await page.getByTestId("admin-settings-submit").click();
      //confirm editing top information works
      await page
        .locator("#pagesheet-wrapper-head")
        .getByRole("button", { name: "Edit" })
        .click();
      await page.getByLabel("Name *").click();
      await page.getByLabel("Name *").fill("DEV TESTING 1");
      await page.getByRole("button", { name: "submit" }).click();
      await page.waitForTimeout(500);
      await page
        .locator("#pagesheet-wrapper-head")
        .filter({ hasText: /DEV TESTING 1/ })
        .click();
      await page
        .locator("#pagesheet-wrapper-head")
        .getByRole("button", { name: "Edit" })
        .click();
      await page.getByLabel("Name *").click();
      await page.getByLabel("Name *").fill("DEV TESTING 2");
      await page.getByLabel("Phone Number").fill(customerInfo.phone);
      await page.getByLabel("Website").fill(customerInfo.website);
      await page.getByLabel("Country").fill(customerInfo.country);
      await page.getByLabel("City").fill(customerInfo.city);
      await page.getByRole("button", { name: "submit" }).click();
      await page
        .locator("#pagesheet-wrapper-head button")
        .filter({ hasText: /Edit/ })
        .click();
      await page.getByTestId("close-customer-modal-button").click();
      //confirm return button works
      await page.getByTestId("return-button").click();
      await page.waitForResponse(
        (response) =>
          response.url().includes("advertisers/list") &&
          response.status() === 200,
      );
      await page.getByLabel("Search").fill("DEV TESTING");
      await expect(page.getByRole('checkbox', { name: 'DEV TESTING 2 www.connectedinteractive.com 123456789 Toronto Canada Jun 13, 2016' })).toBeVisible();
    });
  });
});
