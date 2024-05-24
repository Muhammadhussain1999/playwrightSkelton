import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import { v4 as uuid } from "uuid";

const role = roles.admin;

test.describe(`Usage Report for ${role.name}`, () => {
  test.use({ storageState: role.path });

  test("test users list page loads", async ({ page }) => {
    //test that the users lists for the page loads properly
    await page.goto("");
    await page.getByTestId("header-user").click();
    await page.getByRole("menuitem", { name: "Users" }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("users/list") && response.status() === 200,
    );
    await expect(page.getByText("Pending Users")).toBeVisible();
    await expect(
      await page
        .getByTestId("pagesheet-body-root")
        .getByText("Users", { exact: true }),
    ).toBeVisible();
  });
  test("test users search", async ({ page }) => {
    //test that the search within the users page works as expected
    const searchByEmail = roles.datadesk_user?.sign_in_username_email ?? "";
    await page.goto("");
    await page.getByTestId("header-user").click();
    await page.getByRole("menuitem", { name: "Users" }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("users/list") && response.status() === 200,
    );
    await page.getByLabel("Search").click();
    await page.getByLabel("Search").fill(searchByEmail);
    await expect(
      await page.getByRole("checkbox").filter({ hasText: searchByEmail }),
    ).toBeVisible();
  });
  test("test export users", async ({ page }) => {
    //test that the users export works
    await page.goto("");
    await page.getByTestId("header-user").click();
    await page.getByRole("menuitem", { name: "Users" }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("users/list") && response.status() === 200,
    );
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export" }).click();
    await downloadPromise;
  });

  test("test create & delete user", async ({ page }) => {
    //test the creation and deletion of a user
    await page.goto("");
    await page.getByTestId("header-user").click();
    await page.getByRole("menuitem", { name: "Users" }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("users/list") && response.status() === 200,
    );
    // @todo once users bug is fixed, then make sure this test passes PMM-6068

    const newUseremail = `test-${uuid()}@test.com`;
    let userId: number | undefined;

    await page.getByRole("button", { name: "New User" }).click();
    await page.getByLabel("Email Address *").click();
    await page.getByLabel("Email Address *").fill(newUseremail);
    await page.getByLabel("Email Address *").press("Tab");
    await page.getByLabel("First Name *").fill("test");
    await page.getByLabel("First Name *").press("Tab");
    await page.getByLabel("Last Name *").fill("test");
    await page.getByLabel("Last Name *").press("Tab");
    await page.getByTestId("role_id").getByLabel("Open").click();
    await page.getByRole("option", { name: "Datadesk Admin" }).click();
    await page.getByLabel("Assign to Customer *").click();
    await page
      .getByTestId("advertiser_id")
      .getByLabel("Assign to Customer *")
      .fill("connec");
    await page.getByRole("option", { name: "Connected Interactive" }).click();
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForResponse(async (response) => {
      if (!(response.url().includes("users/edit") && response.status() === 200))
        return false;
      const body = (await response.json()) as any;
      userId = body?.user?.id;
      return true;
    });

    await page.getByLabel("Search").click();
    await page.getByLabel("Search").fill(newUseremail);
    await page
      .getByTestId(`datadesk-table-tbody-td-default-table-${userId}-edit`)
      .first()
      .getByLabel("delete")
      .click();
    await page.getByRole("button", { name: "Remove" }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("users/delete") && response.status() === 200,
    );
    await page.waitForTimeout(1000);
    const el = await page.getByTestId(
      `datadesk-table-tbody-td-default-table-${userId}-edit`,
    );
    const elCount = await el.count();
    await expect(elCount).toBe(0);
  });
});
