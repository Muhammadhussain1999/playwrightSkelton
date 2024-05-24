import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import { selectTaxonomies } from "helpers/listTaxonomies";

const role = roles.admin;
test.describe(`DMP Integrations test for ${role.name}`, () => {
  test.use({ storageState: role.path });
  test.beforeEach(async ({ page }) => {
    await page.goto("");
    await page.getByTestId("header-user").click();
    await page.getByRole("menuitem", { name: "DMP Integrations" }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("DataManagementPlatform/list") &&
        response.status() === 200,
    );
  });

  test("DMP integration list succesfully loads", async ({ page }) => {
    await expect(
      page.getByText("Device Management Platform Integrations"),
    ).toBeVisible();
  });

  test("create a dmp integration succesfully", async ({ page }) => {
    await page.getByTestId("create-button").click();
    await page
      .getByTestId("data_management_platform_id")
      .getByLabel("Open")
      .click();
    await page.getByRole("option", { name: "The Trade Desk" }).click();
    const numberOfTaxonomies = 4;
    await selectTaxonomies(page, numberOfTaxonomies);
    await page.getByTestId("save-dmp").click();
    //check create response is successful
    await page.waitForResponse(
      (response) =>
        response.url().includes("DataManagementPlatform/edit") &&
        response.status() === 200,
    );
    await expect(
      page.getByText("Device Management Platform Integrations"),
    ).toBeVisible();
    //make sure number of taxonomies is updated
    await expect(
      await page.getByRole("checkbox", {
        name: `The Trade Desk ${numberOfTaxonomies}`,
      }),
    ).toBeVisible();
    //check edit DMP functionality
    await page.getByRole("checkbox").first().getByRole("button").click();
    // @todo review this selection below
    // await selectTaxonomies(page, numberOfTaxonomies, { avoidIds: ids });
    // await page.getByTestId('save-dmp').click();
    // //check edit response is successful
    // await page.waitForResponse(
    //   (response) =>
    //     response.url().includes('DataManagementPlatform/edit') && response.status() === 200,
    // );
  });
});
