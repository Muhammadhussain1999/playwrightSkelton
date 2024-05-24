import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import { returnRandomTaxonomies } from "helpers/listTaxonomies";

/* Test for the quick add taxonomies within the search feature */
//adds taxonomies to the cart using the quick add feature and confirms the correct taxonomies and amount have been added
const role = roles.admin;
test.describe(`Quick add taxonomies ${role.name}`, () => {
  test.use({ storageState: role.path });
  test(`Filters Dropdowns ${role.name}`, async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("button", { name: "Quick Add Taxonomies" }).click();
    await expect(
      await page.getByTestId("datadesk-quick-insert-taxonomies-title"),
    ).toBeVisible();
    await page
      .getByPlaceholder(
        "Include your taxonomies ID here (you can split by line, comma, hyphen, etc.)",
      )
      .click();
    const taxonomies = await returnRandomTaxonomies(page, 3);
    await page
      .getByPlaceholder(
        "Include your taxonomies ID here (you can split by line, comma, hyphen, etc.)",
      )
      .fill(taxonomies.ids.join(", "));
    await page.getByTestId("datadesk-loading-spinner").click();
    await expect(
      page.getByText(`${taxonomies.ids.length} taxonomies selected`),
    ).toBeVisible();
    await page.getByTestId("header-cart").click();
    for (const id of taxonomies.ids) {
      await expect(await page.locator(`[id="${id}"]`)).toBeVisible();
    }
  });
});
