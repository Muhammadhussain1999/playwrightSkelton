import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import { selectTaxonomies } from "helpers/listTaxonomies";
import SearchPage from "tests/pages/SearchPage";

Object.values(roles).forEach((role) => {
  test.describe(`Search for ${role.name}`, () => {
    test.use({ storageState: role.path });
    test(`search taxonomies functionality for datadesk`, async ({ page }) => {
      const searchPage = new SearchPage(page, role);
      await searchPage.goto();

      //Select data partner from data sources dropdown
      await page
        .getByTestId("filter_data_partners_dropdown")
        .getByLabel("Open")
        .click();
      await page
        .getByRole("option", {
          name: /Connected Interactive \(\d+ Taxonomies\)/,
        })
        .click();
      await expect(
        await page
          .getByTestId("datadesk-table-pagination-top-search-taxonomies")
          .filter({ hasText: /\d+/ }),
      ).toBeVisible();
      await page
        .getByTestId("filter_data_partners_dropdown")
        .getByLabel("Clear")
        .click();
      //Add Taxonomies  to cart
      const selectedTaxonomies = await selectTaxonomies(page, 3);
      await page.getByTestId("header-cart").click();
      let count = selectedTaxonomies.ids.length;
      //confirm correct taxonomies are in the cart;
      const idsSelected = [...selectedTaxonomies.ids];
      for (const id of selectedTaxonomies.ids) {
        await expect(await page.locator(`[id="${id}"]`)).toBeVisible();
      }
      /**
       * Due to the current usage of Pinecone to support private taxonomies, the following code is commented out.
       */
      // if (role.is_employee && selectedTaxonomies.privateIdsExisting.length > 0) {
      //   await page.waitForTimeout(1000);
      //   //Add private taxonomy to cart
      //   const { id: privateId, name: privateName } = selectedTaxonomies.privateIdsExisting[0];
      //   await page.keyboard.press('Escape');

      //   await page.getByLabel('Keywords').click();
      //   await page.getByLabel('Keywords').fill(privateName);
      //   await page.getByRole('button', { name: 'Search', exact: true }).click();

      //   await page.locator(`#checkbox-input-${privateId}`).check();
      //   await page.getByTestId('header-cart').click();
      //   const [a, b] = [Math.trunc(privateId / 10000), privateId % 10000];
      //   await expect(await page.locator(`[id="\\3${a} ${b}"]`)).toBeVisible();
      //   count++;
      //   idsSelected.push(privateId);
      // }
      count += 0;
      //Download Cart
      await page.getByTestId("cart-options").click();
      const downloadPromise = page.waitForEvent("download");
      await page.getByTestId("cart-download").click();
      const _download = await downloadPromise;
      await page.locator("#cart-options-menu > div").first().click();
      await page.keyboard.press("Escape");
      await page.getByTestId("header-cart").click();
      await expect(
        await page.locator("#datadesk-cart").getByText(`${count} Taxonomies`),
      ).toBeVisible();
      const firstId = idsSelected.shift();
      await page.locator(`#cart-item-remove-${firstId}`).click();
      await expect(
        await page
          .locator("#datadesk-cart")
          .getByText(`${count - 1} Taxonomies`),
      ).toBeVisible();
      //confirm that the cart is empty
      await page.getByTestId("cart-options").click();
      await page.getByText("Empty Cart").click();
      await page.locator("#cart-options-menu > div").first().click();
      await expect(
        await page.locator("#datadesk-cart").getByText("0 Taxonomies"),
      ).toBeVisible();
      await page.getByText("No taxonomy selected.").click();
      await page.locator("#datadesk-cart").getByText("0 Taxonomies").click();
      await page.keyboard.press("Escape");
    });
  });
});
