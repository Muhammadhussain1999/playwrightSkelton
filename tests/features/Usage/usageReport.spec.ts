import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";

const role = roles.admin;
test.describe(`Usage Report for ${role.name}`, () => {
  test.use({ storageState: role.path });
  test("test usage report parameters", async ({ page }) => {
    await page.goto("/financials");
    await page.getByTestId("header-user").click();
    await page.getByRole("menuitem", { name: "Usage" }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("audiences/get_audiences_financial") &&
        response.status() === 200,
    );
    await page.waitForTimeout(1000);
    await page.waitForSelector("#revenue-summary");
    //expect that the analytics boxes with information appear
    await expect(await page.locator("#gross-summary")).toBeVisible;
    await expect(await page.locator("#net-revenue-summary")).toBeVisible;
    await expect(await page.locator("#tech-fee-summary")).toBeVisible;
    await expect(await page.locator("#applied-post-cost-summary")).toBeVisible;
    await expect(await page.locator("#data-partner-revenue-summary"))
      .toBeVisible;
    //expect advertisers to reload analytics boxes
    await page.getByTestId("advertisers").getByLabel("Open").click();

    // @todo API is not returning proper values
    test.skip();
    await page.getByRole("option").nth(3).click();
    await page.waitForTimeout(1000);
    await page.waitForSelector("#revenue-summary");
    await page.getByTestId("advertisers").getByLabel("Clear").click();
    //expect data partner selection to reload analytics boxes;
    await page.getByTestId("data_partners").getByLabel("Open").click();
    await page.getByRole("option").nth(3).click();
    await page.waitForTimeout(1000);
    await page.waitForSelector("#revenue-summary");
    await page.getByTestId("data_partners").getByLabel("Clear").click();
    //expect customer selection to reload analytics boxes;
    await page.getByTestId("audiences").getByLabel("Open").click();
    await page.getByRole("option").nth(3).click();
    await page.waitForTimeout(1000);
    await page.waitForSelector("#revenue-summary");
    await page.getByTestId("audiences").getByLabel("Clear").click();
    //expect user selection to reload analytics boxes;
    await page.getByTestId("users").getByLabel("Open").click();
    await page.getByRole("option").nth(3).click();
    await page.waitForTimeout(1000);
    await page.waitForSelector("#revenue-summary");
    await page.getByTestId("users").getByLabel("Clear").click();
    //expect "datadesk only" selection to reload analytics boxes;
    await page.getByTestId("datadesk_only").getByLabel("Open").click();
    await page.getByRole("option", { name: "Yes" }).click();
    await page.waitForTimeout(1000);
    await page.waitForSelector("#revenue-summary");
    await page.getByTestId("datadesk_only").getByLabel("Clear").click();
    //expect date selection selection to reload analytics boxes;
    await page.getByLabel("Choose date").nth(0).click();
    await page.getByRole("radio", { name: "2019" }).click();
    await page.waitForTimeout(1000);
    await page.waitForSelector("#revenue-summary");
    await page.getByLabel("Choose date").nth(1).click();
    await page.getByRole("radio", { name: "2022" }).click();
  });
});
