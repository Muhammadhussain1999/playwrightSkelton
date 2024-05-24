import { test, expect, Response, Locator } from "@playwright/test";
import { v4 as uuid } from "uuid";
import { samples as roles } from "fixtures/configs/roles";
import AudienceBuilderListPage from "tests/pages/audienceBuilder/list";
import AudienceBuilderEditPage from "tests/pages/audienceBuilder/edit";

const role = roles.admin;
test.describe(`Audience Builder for ${role.name}`, () => {
  test.use({ storageState: role.path });
  const key = uuid();
  const taxonomyName = `${key}`;
  const taxonomyNameEdited = `${key} v2`;
  test("Happy path to create & update a devices custom taxonomy", async ({
    page,
  }) => {
    await test.slow();
    let customAudienceId: number;
    let audienceBuilderEditPage = new AudienceBuilderEditPage(page, role, {
      type: "devices",
    });
    const audienceBuilderListPage = new AudienceBuilderListPage(page, role);
    await audienceBuilderListPage.goto();
    await audienceBuilderListPage.buildButton.click();

    //START Create Device Based Audience
    await test.step(`Create Audience: fill in form: data partner, customer, audience behaviour, category, segment, taxonomy name, cpm`, async () => {
      await audienceBuilderEditPage.audienceInformation.selectDataPartner(
        "Connected Interactive",
      );
      await audienceBuilderEditPage.audienceInformation.selectCustomer(
        "DD DEMO",
      );
      await audienceBuilderEditPage.audienceInformation.selectCategory(
        undefined,
        2,
      );
      await audienceBuilderEditPage.audienceInformation.selectSegment(
        undefined,
        4,
      );
      await audienceBuilderEditPage.audienceInformation.fillTaxonomyName(
        taxonomyName,
      );
      await audienceBuilderEditPage.audienceInformation.fillCpm("3");
    });

    await test.step(`Select blended taxonomy type`, async () => {
      await audienceBuilderEditPage.audienceComposition.setCompositionType(
        "devices",
      );
      await expect(
        await audienceBuilderEditPage.audienceComposition.compositionType(
          "devices",
        ),
      ).toBeChecked();
    });

    await test.step(`Upload Devices CSV`, async () => {
      await audienceBuilderEditPage.builderDevices.setFile(
        "fixtures/upload/audience_builder/devices.csv",
      );
    });

    await test.step(`Save Audience`, async () => {
      let createResponse: Response;
      await audienceBuilderEditPage.saveButton.click();
      await page.waitForResponse(async (response) => {
        createResponse = response;
        return response.url().includes("audience_builder/Devices/create");
      });
      await page.waitForRequest((request) =>
        request.url().includes("AudienceBuilder/list"),
      );
      customAudienceId = (await createResponse!.json()).custom_audience_id;
    });

    await test.step(`Validate if the audience is visible in the table. If so, go to edit it`, async () => {
      await audienceBuilderListPage
        .rowEditButton({ name: taxonomyName })
        .click();
      await expect(page.getByText("Edit Audience")).toBeVisible();
      audienceBuilderEditPage = new AudienceBuilderEditPage(page, role, {
        id: `${customAudienceId}`,
        type: "devices",
      });
    });

    await test.step(`Update values: CPM and Taxonomy Name`, async () => {
      await audienceBuilderEditPage.audienceInformation.fillCpm("4");
      await audienceBuilderEditPage.audienceInformation.fillTaxonomyName(
        taxonomyNameEdited,
      );
      await audienceBuilderEditPage.builderDevices.builderTab.click();
      await audienceBuilderEditPage.saveButton.click();
    });

    await test.step(`Validate if the audience is visible in the table with the new name`, async () => {
      await page.waitForRequest((response) =>
        response.url().includes("AudienceBuilder/list"),
      );

      const row = audienceBuilderListPage.audienceRow({
        name: taxonomyNameEdited,
      });
      await expect(row).toBeVisible();
    });

    await test.step(`Delete Audience`, async () => {
      await audienceBuilderListPage
        .rowDeleteButton({ name: taxonomyNameEdited })
        .click();
      await audienceBuilderListPage.confirmDeleteButton.click();
      const row = audienceBuilderListPage.audienceRow({
        name: taxonomyNameEdited,
      });
      await expect(row).not.toBeVisible();
    });
  });
});
