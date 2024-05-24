import { test, expect, Page } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import {
  selectTaxonomies,
} from "helpers/listTaxonomies";
import { deleteOrder } from "helpers/orders";
import { get_mock_user } from "helpers/users/get";
import { SearchPage } from "tests/pages/SearchPage";
import { fulfillStepTwo } from "helpers/checkout/fulfillStepTwo";
import { fulfillStepOne } from "helpers/checkout/fulfillStepOne";

/**
 * This test checks the Adform checkout workflow
 * Adform -> Marketplace -> Seat ID -> CAD
 * Adform -> Marketplace -> Seat ID -> USD
 * Adform -> Marketplace -> Seat ID -> EUR
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
    test(`Happy Path Checkout Test AdForm, Marketplace, EUR`, async ({
      page,
    }) => {
      const dsp = {
        name: "Adform",
        product: { name: "Marketplace", label: "AdForm Seat ID" },
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
        await expect(page.getByText(dsp.currency)).toBeVisible();
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
        await expect(page.getByText(dsp.currency)).toBeVisible();
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
    test(`DSP Checkout Test without valid information test`, async ({
      page,
    }) => {
      const dsp = {
        name: "Adform",
        product: { name: "Marketplace", label: "AdForm Seat ID" },
      };
      if (role.name === "Admin") {
        const mock_user = await get_mock_user();
        const Search = new SearchPage(page);
        await Search.goto();
        const selectedTaxonomies = await selectTaxonomies(page, 2);
        await Search.goToCheckout();
        const StepOnePage: Page = await fulfillStepOne(page, role, mock_user);
        const StepTwoPage = await fulfillStepTwo(page, role, mock_user);
        //DSP
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("publisher_id").click();
        await page.getByRole("option", { name: dsp.name }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "EUR" }).click();
        await page.getByTestId("validate_dsp_on_lotame").click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
        await page.getByTestId("datadesk-order-actions-top-next").click();
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
        await page.getByRole("option", { name: dsp.name }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "EUR" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
        await page.getByTestId("datadesk-order-actions-top-next").click();
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
        await page.getByRole("option", { name: dsp.name }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByTestId("product").getByLabel("Open").click();
        await page.getByRole("option", { name: dsp.product.name }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeDisabled();
        await page.getByLabel(`${dsp.product.label} *`).fill("123");
        await page.getByTestId("currency").getByLabel("Open").click();
        await page.getByRole("option", { name: "EUR" }).click();
        await expect(
          page.getByTestId("datadesk-order-actions-top-next"),
        ).toBeEnabled();
        await page.getByTestId("datadesk-order-actions-top-next").click();
      }
    });
  });
});
