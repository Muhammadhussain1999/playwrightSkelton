import { test, expect, Page } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import {
  selectTaxonomies,
  selectPrivateTaxonomies,
} from "helpers/listTaxonomies";
import { deleteOrder } from "helpers/orders";

/**
 * This test is for the case where the user selects a private taxonomy that is not available for the customer
 * The user should see an error message and not be able to continue until they remove the invalid taxonomies.
 * This test is only for employee users. If a non-employee user selects a private taxonomy, they will not be able to checkout.
 */

Object.values(roles).map((role) => {
  test.describe(`Checkout process for ${role.name}`, () => {
    test.use({ storageState: role.path });
    let orderId: undefined | number;
    test.afterAll(async ({ browser }) => {
      if (orderId !== undefined) {
        await deleteOrder(browser, orderId, { storageState: roles.admin.path });
      }
    });
    test(`Private taxonomy checkout for ${role.name}`, async ({ page }) => {
      // If the user is not an employee, skip this test because they will not be able to checkout private taxonomies
      if (!role.is_employee) {
        test.skip();
      }

      // await page.goto('/search');

      const { ids: privateIdsInitial } = await selectPrivateTaxonomies(page, 1);
      await page.getByTestId("header-cart").click();
      await page.getByTestId("cart-checkout").click();
      let table = await page.getByTestId("datadesk-order-taxonomies-table");
      await expect(table).toBeVisible();
      let rows = await table.locator("tbody tr");
      await expect(await rows.count()).toBe(1);
      for (const id of privateIdsInitial) {
        await expect(
          await page
            .getByTestId("datadesk-order-taxonomies-table")
            .locator(
              `#datadesk-table-tbody-row-datadesk-order-taxonomies-table-${id}`,
            ),
        ).toBeVisible();
      }

      await page.getByLabel("Customer *").click();
      await page.getByRole("option").nth(1).click();

      let title = await page.getByTestId("datadesk-confirmation-modal-title");
      let text = await page.getByTestId("datadesk-confirmation-modal-content");

      await expect(await title).toContainText(/Private Taxonomy Selected/);
      await expect(await text).toContainText(
        /This taxonomy is private and unavailable to chosen customer:\S+If you add it anyways it will be removed from your order's segments./,
      );

      await expect(
        await page.getByRole("button", { name: "Okay" }),
      ).toBeVisible();
      await expect(
        await page.getByRole("button", { name: "Okay" }),
      ).toBeEnabled();
      await page.getByRole("button", { name: "Okay" }).click();

      await expect(await page.url()).toContain("/search");

      //select taxonomies and go to checkout
      const { ids: privateIds } = await selectPrivateTaxonomies(page, 1);
      const { ids: publicIds } = await selectTaxonomies(page, 2);
      await page.getByTestId("header-cart").click();
      await page.getByTestId("cart-checkout").click();

      // Check if the number of taxonomies matches: 1 private + 2 public
      table = await page.getByTestId("datadesk-order-taxonomies-table");
      await expect(table).toBeVisible();
      rows = await table.locator("tbody tr");
      await expect(await rows.count()).toBe(3);

      for (const id of privateIds) {
        await expect(
          await page
            .getByTestId("datadesk-order-taxonomies-table")
            .locator(
              `#datadesk-table-tbody-row-datadesk-order-taxonomies-table-${id}`,
            ),
        ).toBeVisible();
      }
      for (const id of publicIds) {
        await expect(
          await page
            .getByTestId("datadesk-order-taxonomies-table")
            .locator(
              `#datadesk-table-tbody-row-datadesk-order-taxonomies-table-${id}`,
            ),
        ).toBeVisible();
      }

      await page.getByLabel("Customer *").click();
      await page.getByRole("option").nth(2).click();

      title = await page.getByTestId("datadesk-confirmation-modal-title");
      text = await page.getByTestId("datadesk-confirmation-modal-content");

      await expect(await title).toContainText(/Private Taxonomy Selected/);
      await expect(await text).toContainText(
        /This taxonomy is private and unavailable to chosen customer:\S+If you add it anyways it will be removed from your order's segments./,
      );

      await expect(
        await page.getByRole("button", { name: "Okay" }),
      ).toBeVisible();
      await expect(
        await page.getByRole("button", { name: "Okay" }),
      ).toBeEnabled();
      await page.getByRole("button", { name: "Okay" }).click();

      await expect(
        await page
          .getByTestId("datadesk-order-taxonomies-table")
          .locator("tbody tr")
          .count(),
      ).toBe(2);

      for (const id of publicIds) {
        await expect(
          await page
            .getByTestId("datadesk-order-taxonomies-table")
            .locator(
              `#datadesk-table-tbody-row-datadesk-order-taxonomies-table-${id}`,
            ),
        ).toBeVisible();
      }

      for (const id of privateIds) {
        await expect(
          await page
            .getByTestId("datadesk-order-taxonomies-table")
            .locator(
              `#datadesk-table-tbody-row-datadesk-order-taxonomies-table-${id}`,
            ),
        ).not.toBeVisible();
      }

      await expect(await page.url()).toContain("/order");
    });
  });
});
