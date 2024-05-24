import { test, expect, Page } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import { selectTaxonomies } from "helpers/listTaxonomies";
import { deleteOrder } from "helpers/orders";
import { get_mock_user } from "helpers/users/get";
import { SearchPage } from "tests/pages/SearchPage";
import { fulfillStepTwo } from "helpers/checkout/fulfillStepTwo";
import { fulfillStepOne } from "helpers/checkout/fulfillStepOne";
/**
 * This test checks the Google checkout workflow
 * Google -> GAM 360 -> Google Client -> USD
 * Google -> GAM 360 -> Google Client -> EUR
 * Google -> GAM 360 -> Google Client ID -> CAD
 * Google -> DV360 Ad -> Google Client ID ->USD
 * Google -> DV360 Ad -> Google Client ID ->EUR
 * Google -> DV360 Ad -> Google Client ID ->CAD
 * Google -> DV360 Partner -> Google Client ID ->USD
 * Google -> DV360 Partner -> Google Client ID ->EUR
 * Google -> DV360 Partner -> Google Client ID ->CAD
 * This checks the roles of Admin, Datadesk Admin, Datadesk User
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
    test(`Happy Path Checkout Test Google, GAM 360, CAD`, async ({ page }) => {
      const dsp = {
        name: "Google",
        product: { name: "Google Ad Manager 360", label: "Link ID" },
        currency: "CAD",
      };
      await page.route(/audiences\/edit$/, async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        // include the order id in the cache that will clean up later
        if (json?.audience?.id) {
          orderId = parseInt(json.audience.id);
        }
        await route.fulfill({ response, json });
      });
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(page.getByText(dsp.currency)).toBeVisible();
        await expect(page.getByText(mock_user.username)).toBeVisible();
        await expect(page.getByText(mock_user.email)).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.email }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.username }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
    });
    test(`Happy Path Checkout Test Google, GAM 360, USD`, async ({ page }) => {
      const dsp = {
        name: "Google",
        product: { name: "Google Ad Manager 360", label: "Link ID" },
        currency: "USD",
      };
      await page.route(/audiences\/edit$/, async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        // include the order id in the cache that will clean up later
        if (json?.audience?.id) {
          orderId = parseInt(json.audience.id);
        }
        await route.fulfill({ response, json });
      });
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        await expect(page.getByText(mock_user.username)).toBeVisible();
        await expect(page.getByText(mock_user.email)).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.email }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.username }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
    });
    test(`Happy Path Checkout Test Google, GAM 360, EUR`, async ({ page }) => {
      const dsp = {
        name: "Google",
        product: { name: "Google Ad Manager 360", label: "Link ID" },
        currency: "EUR",
      };
      await page.route(/audiences\/edit$/, async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        // include the order id in the cache that will clean up later
        if (json?.audience?.id) {
          orderId = parseInt(json.audience.id);
        }
        await route.fulfill({ response, json });
      });
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        await expect(page.getByText(mock_user.username)).toBeVisible();
        await expect(page.getByText(mock_user.email)).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.email }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.username }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
    });
    test(`Happy Path Checkout Test Google, DV 360 Ad, CAD`, async ({
      page,
    }) => {
      const dsp = {
        name: "Google",
        product: {
          name: "Display & Video 360 - Advertiser Level",
          label: "Google Client ID",
        },
        currency: "CAD",
      };
      await page.route(/audiences\/edit$/, async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        // include the order id in the cache that will clean up later
        if (json?.audience?.id) {
          orderId = parseInt(json.audience.id);
        }
        await route.fulfill({ response, json });
      });
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123456");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        await expect(page.getByText(mock_user.username)).toBeVisible();
        await expect(page.getByText(mock_user.email)).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.email }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.username }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123456");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123456");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
    });
    test(`Happy Path Checkout Test Google, DV 360 Ad, USD`, async ({
      page,
    }) => {
      const dsp = {
        name: "Google",
        product: {
          name: "Display & Video 360 - Advertiser Level",
          label: "Google Client ID",
        },
        currency: "USD",
      };
      await page.route(/audiences\/edit$/, async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        // include the order id in the cache that will clean up later
        if (json?.audience?.id) {
          orderId = parseInt(json.audience.id);
        }
        await route.fulfill({ response, json });
      });
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        await expect(page.getByText(mock_user.username)).toBeVisible();
        await expect(page.getByText(mock_user.email)).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.email }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.username }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
    });
    test(`Happy Path Checkout Test Google, DV 360 Ad, EUR`, async ({
      page,
    }) => {
      const dsp = {
        name: "Google",
        product: {
          name: "Display & Video 360 - Advertiser Level",
          label: "Google Client ID",
        },
        currency: "EUR",
      };
      await page.route(/audiences\/edit$/, async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        // include the order id in the cache that will clean up later
        if (json?.audience?.id) {
          orderId = parseInt(json.audience.id);
        }
        await route.fulfill({ response, json });
      });
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        await expect(page.getByText(mock_user.username)).toBeVisible();
        await expect(page.getByText(mock_user.email)).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.email }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.username }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
    });
    test(`Happy Path Checkout Test Google, DV 360 Partner, CAD`, async ({
      page,
    }) => {
      const dsp = {
        name: "Google",
        product: {
          name: "Display & Video 360 - Partner Level",
          label: "Google Client ID",
        },
        currency: "CAD",
      };
      await page.route(/audiences\/edit$/, async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        // include the order id in the cache that will clean up later
        if (json?.audience?.id) {
          orderId = parseInt(json.audience.id);
        }
        await route.fulfill({ response, json });
      });
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        await expect(page.getByText(mock_user.username)).toBeVisible();
        await expect(page.getByText(mock_user.email)).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.email }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.username }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
    });
    test(`Happy Path Checkout Test Google, DV 360 Partner, USD`, async ({
      page,
    }) => {
      const dsp = {
        name: "Google",
        product: {
          name: "Display & Video 360 - Partner Level",
          label: "Google Client ID",
        },
        currency: "USD",
      };
      await page.route(/audiences\/edit$/, async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        // include the order id in the cache that will clean up later
        if (json?.audience?.id) {
          orderId = parseInt(json.audience.id);
        }
        await route.fulfill({ response, json });
      });
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page
          .getByRole("option", { name: dsp.currency, exact: true })
          .click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        await expect(page.getByText(mock_user.username)).toBeVisible();
        await expect(page.getByText(mock_user.email)).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.email }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.username }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
    });
    test(`Happy Path Checkout Test Google, DV 360 Partner, EUR`, async ({
      page,
    }) => {
      const dsp = {
        name: "Google",
        product: {
          name: "Display & Video 360 - Partner Level",
          label: "Google Client ID",
        },
        currency: "EUR",
      };
      await page.route(/audiences\/edit$/, async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        // include the order id in the cache that will clean up later
        if (json?.audience?.id) {
          orderId = parseInt(json.audience.id);
        }
        await route.fulfill({ response, json });
      });
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page
          .getByRole("option", { name: dsp.currency, exact: true })
          .click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        await expect(page.getByText(mock_user.username)).toBeVisible();
        await expect(page.getByText(mock_user.email)).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.email }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: mock_user.username }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.currency }).click();
        await page.getByTestId("datadesk-order-actions-top-next").click();
        //Confirm
        await expect(page.getByText(dsp.name).first()).toBeVisible();
        await expect(page.getByText(dsp.product.name)).toBeVisible();
        await expect(page.getByText(dsp.product.label)).toBeVisible();
        await expect(
          page.getByText(dsp.currency, { exact: true }),
        ).toBeVisible();
        page.getByTestId("datadesk-order-actions-top-next").click();
        //Check Invoice
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.name }),
        ).toBeVisible();
        await expect(
          page
            .locator("#datadesk-order-invoice-pdf")
            .filter({ hasText: dsp.product.label }),
        ).toBeVisible();
        await expect(
          page.getByTestId("datadesk-order-invoice-pdf-footer"),
        ).toBeVisible();
      }
    });
    test(`Checkout Test Google- GAM 360 - DSP Labels and Validity`, async ({
      page,
    }) => {
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        // GAM 360
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: "Google" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page
          .getByRole("option", { name: "Google Ad Manager 360" })
          .click();
        await page.getByLabel(`Link ID *`).fill("123");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "USD" }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: "Google" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page
          .getByRole("option", { name: "Google Ad Manager 360" })
          .click();
        await page.getByLabel(`Link ID *`).fill("123");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "USD" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: "Google" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page
          .getByRole("option", { name: "Google Ad Manager 360" })
          .click();
        await page.getByLabel(`Link ID *`).fill("123");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "USD" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
      }
    });
    test(`Checkout Test Google- DV360 PARTNER - DSP Labels and Validity`, async ({
      page,
    }) => {
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);

        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: "Google" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page
          .getByRole("option", {
            name: "Display & Video 360 - Advertiser Level",
          })
          .click();
        await page.getByLabel(`Google Client ID *`).fill("123");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "USD" }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: "Google" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page
          .getByRole("option", {
            name: "Display & Video 360 - Advertiser Level",
          })
          .click();
        await page.getByLabel(`Google Client ID *`).fill("123");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "USD" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: "Google" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page
          .getByRole("option", {
            name: "Display & Video 360 - Advertiser Level",
          })
          .click();
        await page.getByLabel(`Google Client ID *`).fill("123");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "USD" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
      }
    });
    test(`Checkout Test Google- DV360 AD- DSP Labels and Validity`, async ({
      page,
    }) => {
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: "Google" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page
          .getByRole("option", { name: "Display & Video 360 - Partner Level" })
          .click();
        await page.getByLabel(`Google Client ID *`).fill("123456");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "USD" }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
      }
      if (role.name === "Datadesk Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: "Google" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page
          .getByRole("option", { name: "Display & Video 360 - Partner Level" })
          .click();
        await page.getByLabel(`Google Client ID *`).fill("123");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "USD" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
      }
      if (role.name === "Datadesk User") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: "Google" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page
          .getByRole("option", { name: "Display & Video 360 - Partner Level" })
          .click();
        await page.getByLabel(`Google Client ID *`).fill("123");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "USD" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
      }
    });
  });
});
