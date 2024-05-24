import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import SearchPage from "tests/pages/SearchPage";

/* Test for the search filters within the search feature */

Object.values(roles).map((role) => {
  test.describe(`Search Filters for ${role.name}`, () => {
    test.use({ storageState: role.path });
    test(`Filters Dropdowns ${role.name}`, async ({ page }) => {
      const searchPage = new SearchPage(page, role);
      await searchPage.goto();
      //check "Data Sources" dropdown and confirm it is populated
      await searchPage.filters.dataPartnerSelect.click();
      await expect(
        await page.getByRole("option", {
          name: /Connected Interactive \(\d+ Taxonomies\)/,
        }),
      ).toBeVisible();
      await expect(
        await page.getByRole("listbox", { name: "Filter By Data Sources" }),
      ).toBeVisible();
      const popupDataPartners = await page.getByRole("listbox", {
        name: "Filter By Data Sources",
      });
      await expect(
        await popupDataPartners.getByRole("option", { name: "Select All" }),
      ).toBeVisible();
      await expect(
        await popupDataPartners.getByRole("option", { name: "Remove All" }),
      ).toBeVisible();
      //check "Categories" dropdown and confirm it is populated
      await page.getByLabel("Filter By Categories").click();
      await expect(
        await page
          .getByRole("listbox", { name: "Filter By Categories" })
          .getByText(/Connected Interactive/),
      ).toBeVisible();
      let popupDataPartnersSources = await page.getByRole("listbox", {
        name: "Filter By Categories",
      });
      await expect(
        popupDataPartnersSources.getByRole("option", { name: "Select All" }),
      ).toBeVisible();
      await expect(
        popupDataPartnersSources.getByRole("option", { name: "Remove All" }),
      ).toBeVisible();
      //check "Segments" dropdown and confirm it is populated
      await page.getByLabel("Filter By Segments").click();
      await expect(
        await page.getByRole("listbox", { name: "Filter By Segments" }),
      ).toBeVisible();
      let popupSegments = await page.getByRole("listbox", {
        name: "Filter By Segments",
      });
      await expect(
        popupSegments.getByRole("option", { name: "Select All" }),
      ).toBeVisible();
      await expect(
        popupSegments.getByRole("option", { name: "Remove All" }),
      ).toBeVisible();

      // Click and check visual values:
      // make sure when clicked that the value appears in the input of the dropdown
      await page.getByLabel("Filter By Data Sources").click();
      await page
        .getByRole("option", {
          name: /Connected Interactive \(\d+ Taxonomies\)/,
        })
        .click();
      await expect(
        await page.getByRole("button", {
          name: /Connected Interactive \(\d+ Taxonomies\)/,
        }),
      ).toBeVisible();

      await page.getByLabel("Filter By Categories").click();
      await expect(
        await page
          .getByRole("listbox", { name: "Filter By Categories" })
          .getByText(/Connected Interactive/),
      ).toBeVisible();
      popupDataPartnersSources = await page.getByRole("listbox", {
        name: "Filter By Categories",
      });
      await expect(
        popupDataPartnersSources.getByRole("option", { name: "Select All" }),
      ).toBeVisible();
      await expect(
        popupDataPartnersSources.getByRole("option", { name: "Remove All" }),
      ).toBeVisible();

      await page.getByLabel("Filter By Segments").click();
      await expect(
        await page
          .getByRole("listbox", { name: "Filter By Segments" })
          .getByText(/Connected Interactive/),
      ).toBeVisible();
      popupSegments = await page.getByRole("listbox", {
        name: "Filter By Segments",
      });
      await expect(
        popupSegments.getByRole("option", { name: "Select All" }),
      ).toBeVisible();
      await expect(
        popupSegments.getByRole("option", { name: "Remove All" }),
      ).toBeVisible();
    });
  });
});
