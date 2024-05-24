import { test, expect } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import AudienceBuilderListPage from "tests/pages/audienceBuilder/list";

const role = roles.admin;
test.use({ storageState: role.path });
test.describe(`Audience Builder Bulk Create for ${role.name}`, () => {
  test(`Bulk Create Custom Taxonomies with invalid file`, async ({ page }) => {
    const audienceBuilderListPage = new AudienceBuilderListPage(page, role);
    await audienceBuilderListPage.goto();

    await audienceBuilderListPage.openBulkCreateModal();
    await audienceBuilderListPage.bulkCreateModal.setFile(
      "fixtures/upload/audience_builder/bulk_create_invalid_duplicated.xlsx",
    );
    await expect(
      await audienceBuilderListPage.bulkCreateModal.table,
    ).not.toBeVisible();
    await expect(
      await audienceBuilderListPage.bulkCreateModal.alert,
    ).toBeVisible();
    await expect(
      await audienceBuilderListPage.bulkCreateModal.closeButton,
    ).toBeEnabled();
    await expect(
      await audienceBuilderListPage.bulkCreateModal.buildButton,
    ).toBeDisabled();
  });

  test(`Bulk Create Custom Taxonomies with valid file`, async ({ page }) => {
    const audienceBuilderListPage = new AudienceBuilderListPage(page, role);
    await audienceBuilderListPage.goto();

    await audienceBuilderListPage.openBulkCreateModal();
    await audienceBuilderListPage.bulkCreateModal.setFile(
      "fixtures/upload/audience_builder/bulk_create_valid.xlsx",
    );
    await expect(
      await audienceBuilderListPage.bulkCreateModal.table,
    ).toBeVisible();
    await expect(
      await audienceBuilderListPage.bulkCreateModal.alert,
    ).not.toBeVisible();

    const tableRows =
      await audienceBuilderListPage.bulkCreateModal.tableRows.all();
    await expect(tableRows).toHaveLength(8);
    await expect(
      await audienceBuilderListPage.bulkCreateModal.closeButton,
    ).toBeEnabled();
    await expect(
      await audienceBuilderListPage.bulkCreateModal.buildButton,
    ).toBeEnabled();
  });
});
