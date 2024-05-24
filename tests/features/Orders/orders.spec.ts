import { test, expect } from "@playwright/test";
import { getMockErrors, IMockError } from "fixtures/admin/orders/errors";
import { samples as roles } from "fixtures/configs/roles";
import { deleteOrder, createOrder } from "helpers/orders";

const role = roles.admin;
test.use({ storageState: role.path });
test.describe(`Orders page test for ${role.name}`, () => {
  const orderIds: { [id: number]: string } = {};

  test.afterAll(async ({ browser }) => {
    for (const orderId in orderIds) {
      await deleteOrder(browser, parseInt(orderId), {
        storageState: roles.admin.path,
      });
    }
  });

  test("Use mocked order errors and check Sync Failure fixing", async ({
    browser,
    page,
  }) => {
    let errorsList: IMockError[] = [];

    // Include interceptor for list proposal - it will intercept only the first occurrence due to: `{ times: 1 }`
    await page.route(
      /audiences\/list_proposal\?.*keyword=.+&/,
      async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        if (json?.proposals?.length === 1) {
          errorsList = getMockErrors(json.proposals[0].id);
          json.proposals[0].errors = errorsList;
        }
        await route.fulfill({ response, json });
      },
      { times: 1 },
    );

    // Include interceptor for mark as resolved - it will intercept only the first occurrence due to: `{ times: 1 }`
    await page.route(
      /audiences\/mark_errors_as_resolved/,
      async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        await expect(json?.status).toBe("success");
        /**
         * Since we are mocking the values, we expect that this response is 0 and would
         *    trigger an update in the UI that will remove all errors. However, we will
         *    mock with more errors to test further assertions
         */
        await expect(json?.dmp_integration_errors?.length).toBe(0);

        json.dmp_integration_errors = errorsList;
        await route.fulfill({ response, json });
      },
      { times: 1 },
    );

    const {
      created,
      order: { name: orderName, id: orderId },
    } = await createOrder(browser);

    if (!created || !orderId || !orderName) {
      test.fail();
      return;
    }

    orderIds[orderId] = orderName;

    await page.goto("");
    await page.getByTestId("header-user").click();
    await page.getByRole("menuitem", { name: "Orders" }).click();
    await page.getByLabel("Search").click();
    await page.getByLabel("Search").fill(orderName);
    await page.locator("#query-submit").click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("audiences/list_proposal?") &&
        response.status() === 200,
    );
    await expect(
      await page.locator("td").filter({ hasText: orderName }),
    ).toBeVisible();

    await expect(
      await page.getByTestId(`lotame-sync-${orderId}`),
    ).toBeVisible();
    await page.getByTestId(`lotame-sync-${orderId}`).click();
    await expect(
      await page.locator("#datadesk-table-toolbar-selected"),
    ).not.toBeVisible();
    await expect(
      await page.getByRole("button", { name: "Mark as Resolved" }),
    ).not.toBeVisible();

    // Mark single error as resolved
    const lastError = errorsList.pop();
    await page.locator(`#checkbox-input-${lastError?.id}`).click();
    await expect(
      await page.locator("#datadesk-table-toolbar-selected"),
    ).toBeVisible();
    await expect(
      await page.getByRole("button", { name: "Mark as Resolved" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Mark as Resolved" }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("audiences/mark_errors_as_resolved") &&
        response.status() === 200,
    );

    await expect(
      await page.getByRole("button", { name: "Mark as Resolved" }),
    ).not.toBeVisible();
    await expect(await page.getByLabel("select all items")).toBeVisible();
    await page.getByLabel("select all items").click();
    await expect(
      await page.getByRole("button", { name: "Mark as Resolved" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Mark as Resolved" }).click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("audiences/mark_errors_as_resolved") &&
        response.status() === 200,
    );
    await expect(
      await page.getByRole("button", { name: "Mark as Resolved" }),
    ).not.toBeVisible();
    await expect(
      await page.getByText("No sync error message found."),
    ).toBeVisible();
    await expect(
      await page.getByRole("button", { name: "Close" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();

    // Check if tooltip content was updated
    await expect(
      await page.getByTestId(`lotame-sync-${orderId}`),
    ).toBeVisible();
    await page.getByTestId(`lotame-sync-${orderId}`).hover({ force: true });
    await expect(
      await page.getByText("Step still being processed"),
    ).toBeVisible();
  });

  test("Create Order, search order on orders page, view/delete order", async ({
    browser,
    page,
  }) => {
    test.slow();
    const {
      created,
      order: { name: orderName, id: orderId },
    } = await createOrder(browser);

    if (!created || !orderId || !orderName) {
      test.fail();
      return;
    }

    orderIds[orderId] = orderName;

    // TEST TO SEARCH AND VIEW ORDER//
    await page.goto("");
    await page.getByTestId("header-user").click();
    await page.getByRole("menuitem", { name: "Orders" }).click();
    await page.getByLabel("Search").click();
    await page.getByLabel("Search").fill(orderName);
    await page.locator("#query-submit").click();
    await page.waitForResponse(
      (response) =>
        response.url().includes("audiences/list_proposal?") &&
        response.status() === 200,
    );
    await expect(
      await page.getByRole("heading", { name: "Orders" }),
    ).toBeVisible();
    await expect(
      await page.locator("td").filter({ hasText: orderName }),
    ).toBeVisible();
    //check new tab opens for view/confirm
    const page1Promise = page.waitForEvent("popup");
    await page.getByLabel("view-confirm").first().click();
    await page1Promise;
    //check new tab opens for order health
    const page2Promise = page.waitForEvent("popup");
    await page.getByLabel("order-health").first().click();
    await page2Promise;
    //export order check spreadsheet downloads
    await page.getByLabel("export").first().click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "Spreadsheet" }).click();
    await downloadPromise;
    await page.keyboard.press("Backspace");
    await page.getByLabel("export").nth(1).click();
    //delete order
    await page.getByRole("menu").getByText("Delete").click();
    await page.getByRole("button", { name: "Confirm" }).click();

    // remove requirement to delete order
    if (orderId) {
      delete orderIds[orderId];
    }
  });

  //TEST THE SEARCH FILTERS FOR THE ORDERS PAGE//
  test("test search for orders page", async ({ page }) => {
    await page.goto("");
    await page.getByTestId("header-user").click();
    await page.getByRole("menuitem", { name: "Orders" }).click();
    //Confirm that the orders are listed
    await page.waitForResponse(
      (response) =>
        response.url().includes("/list_proposal") && response.status() === 200,
    );
    //Click each filter option and confirm that it sets
    await page.getByTestId("filter-box").getByLabel("Open").click();
    await page.getByRole("option", { name: "Purchased" }).click();
    await expect(await page.getByText("Purchased")).toBeVisible();
    await page.getByLabel("Filter Orders By").click();
    await page.keyboard.press("Backspace");
    await page.getByTestId("filter-box").getByLabel("Open").click();
    await page.getByRole("option", { name: "Waiting Confirmation" }).click();
    await expect(await page.getByText("Waiting Confirmation")).toBeVisible();
    await page.getByLabel("Filter Orders By").click();
    await page.keyboard.press("Backspace");
    await page.getByTestId("filter-box").getByLabel("Open").click();
    await page.getByRole("option", { name: "Archived" }).click();
    await expect(await page.getByText("Archived")).toBeVisible();
    await page.getByLabel("Filter Orders By").click();
    await page.keyboard.press("Backspace");
    await page.getByTestId("filter-box").getByLabel("Open").click();
    await page.getByRole("option", { name: "Deleted" }).click();
    await expect(await page.getByText("Deleted")).toBeVisible();
    await page.getByLabel("Filter Orders By").click();
    await page.keyboard.press("Backspace");
    await page.getByTestId("filter-box").getByLabel("Open").click();
    await page.getByRole("option", { name: "Failed" }).click();
    await page.keyboard.press("Backspace");
    await page.getByTestId("sandbox").getByLabel("Open").click();
    await page.getByRole("option", { name: "Production Only" }).click();
    const locator = page.locator("input[id=sandbox]");
    await expect(locator).toHaveValue(/Production Only/);
    await page.getByTestId("sandbox").getByLabel("Open").click();
    await page.getByRole("option", { name: "Sandbox Only" }).click();
    await expect(await page.getByText("Sandbox Only")).toBeVisible();
    await page.locator("#query-submit").click();

    // Clear filters
    await page.getByLabel("Filter Orders By").click();
    await page.keyboard.press("Backspace");
    await page.getByTestId("sandbox").getByLabel("Open").click();
    await page.getByRole("option", { name: "Production Only" }).click();
    await page.keyboard.press("Backspace");
  });
});
