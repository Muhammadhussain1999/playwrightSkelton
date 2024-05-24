import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import OrderHealthPage from "tests/pages/orderHealth";

//using an order with an id that has cron logs and files - if changing this order, make sure to update any other applicable information below
const ttd_order_id = "2806";
const ttd_order_dsp = "The Trade Desk";
const ar_order_id = "2831";
const ar_order_dmp = "AudienceRate";
const ar_order_dsp = "Google";

const role = roles.admin;
test.use({ storageState: role.path });
test.describe(`Orders Health for ${role.name}`, () => {
  test("Check Order Health Process for TTD order", async ({ page }) => {
    //get to the orders page, find the order, and go to the healthcheck for that order
    const orderHealthPage = new OrderHealthPage(page, role, {
      orderId: ttd_order_id,
    });

    await validatePage(orderHealthPage, {
      publisherName: ttd_order_dsp,
      dmpName: ttd_order_dsp,
    });

    // Custom TTD fields
    const parsedFields = await orderHealthPage.getParsedOrderDspFields();
    expect(parsedFields).toHaveProperty(
      "Product",
      "Third Party Data - Partner ID",
    );
    expect(parsedFields).toHaveProperty("Seat ID", "j32w4d5");
    expect(parsedFields).not.toHaveProperty("unknown");
    await expect(
      await orderHealthPage.orderDspFields.getByTestId(
        /.*(advertiser_secret)$/,
      ),
    ).not.toBeVisible();
  });

  //test for Google/AR Order
  test("Check Order Health Process for AR/Google order", async ({ page }) => {
    //get to the orders page, find the order, and go to the healthcheck for that order
    const orderHealthPage = new OrderHealthPage(page, role, {
      orderId: ar_order_id,
    });

    await validatePage(orderHealthPage, {
      publisherName: ar_order_dsp,
      dmpName: ar_order_dmp,
    });
  });
});

export async function validatePage(
  orderHealthPage: OrderHealthPage,
  { publisherName, dmpName }: { publisherName: string; dmpName: string },
) {
  await orderHealthPage.goto();

  await expect(await orderHealthPage.orderInfoSection).toBeVisible();
  await expect(await orderHealthPage.orderDspSection).toBeVisible();

  const parsedFields = await orderHealthPage.getParsedOrderDspFields();
  expect(parsedFields).toHaveProperty("Publisher", publisherName);
  await expect(await orderHealthPage.tabs.headers.all()).toHaveLength(3);
  await expect(await orderHealthPage.tabs.currentTab).toContainText(
    "Audience Information",
  );
  await expect(
    await orderHealthPage.tabs.taxonomiesTab.audienceInformationPaper,
  ).toContainText(`DMP: ${dmpName}`);
  await expect(
    await orderHealthPage.tabs.taxonomiesTab.tabs.filter({
      hasText: "Sync History",
    }),
  ).toBeVisible();
  await expect(
    await orderHealthPage.tabs.taxonomiesTab.tabs.filter({ hasText: "Errors" }),
  ).toBeVisible();

  await orderHealthPage.tabs.taxonomiesTab.goToTab("Sync History");
  const syncHistoryTab =
    await orderHealthPage.tabs.taxonomiesTab.SyncHistoryTab;
  await expect(syncHistoryTab).toBeVisible();
  await expect(
    await syncHistoryTab.getByTestId(
      "sync_status_history-table-sync_status_history-tab",
    ),
  ).toBeVisible();

  await expect(
    (await syncHistoryTab.getByRole("row").all()).length,
  ).toBeGreaterThan(0);
  await expect(
    await syncHistoryTab
      .getByRole("table")
      .locator("th")
      .getByText("File Transaction ID"),
  ).toBeVisible();
  await expect(
    await syncHistoryTab.getByRole("table").locator("th").getByText("Date"),
  ).toBeVisible();
  await expect(
    await syncHistoryTab
      .getByRole("table")
      .locator("th")
      .getByText("Match Rate"),
  ).toBeVisible();
  await expect(
    await syncHistoryTab.getByRole("table").locator("th").getByText("Raw File"),
  ).toBeVisible();

  await orderHealthPage.tabs.taxonomiesTab.goToTab("Errors");
  const errorsTab = await orderHealthPage.tabs.taxonomiesTab.ErrorsTab;
  const errorHistoryRows = await errorsTab.locator("tbody > tr").all();
  await expect(errorHistoryRows.length).toBeGreaterThanOrEqual(0);
  if (errorHistoryRows.length > 0) {
    await expect(
      await errorsTab.getByRole("table").locator("th").getByText("Type"),
    ).toBeVisible();
    await expect(
      await errorsTab.getByRole("table").locator("th").getByText("Description"),
    ).toBeVisible();
    await expect(
      await errorsTab.getByRole("table").locator("th").getByText("Status"),
    ).toBeVisible();
    await expect(
      await errorsTab.getByRole("table").locator("th").getByText("Created"),
    ).toBeVisible();
  }

  await orderHealthPage.tabs.goToTab("Files");
  const tableHeaders = await orderHealthPage.tabs.filesTab.tableHeaders;
  await expect(await tableHeaders.getByText("Processed")).toBeVisible();
  // await expect(await tableHeaders.getByText(`${publisherName} File ID`)).toBeVisible();
  await expect(await tableHeaders.getByText(`Match Rate`)).toBeVisible();
  await expect(await tableHeaders.getByText(`Uploaded On`)).toBeVisible();
  await expect(await tableHeaders.getByText(`Completed On`)).toBeVisible();
  await expect(
    (await orderHealthPage.tabs.filesTab.tableRows.all()).length,
  ).toBeGreaterThan(0);

  await orderHealthPage.tabs.goToTab("Logs");
}
