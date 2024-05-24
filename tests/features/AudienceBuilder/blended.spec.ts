import { test, expect, Locator, Response } from "@playwright/test";
import { v4 as uuid } from "uuid";
import { samples as roles } from "fixtures/configs/roles";
import audienceBuilderSimulateMockJson from "fixtures/api_response/audience_builder/simulate.json";
import { selectTaxonomies } from "helpers/listTaxonomies";
import AudienceBuilderEditPage from "tests/pages/audienceBuilder/edit";
import AudienceBuilderListPage from "tests/pages/audienceBuilder/list";

const role = roles.admin;
test.describe(`Audience Builder for ${role.name}`, () => {
  test.use({ storageState: role.path });
  const key = uuid(); //unique key to identify test
  const taxonomyName = `${key}`;
  const taxonomyNameEdited = `${key} v2`;
  test(`Happy path to create & edit a blended custom taxonomy`, async ({
    page,
  }) => {
    await test.slow();
    let selectedTaxonomies: Awaited<
      ReturnType<
        (typeof audienceBuilderEditPage.builderBlended)["selectTaxonomies"]
      >
    > = {
      ids: [],
      privateIdsExisting: [],
    };

    let customAudienceId: number;
    let audienceBuilderEditPage = new AudienceBuilderEditPage(page, role, {
      type: "blended",
    });
    const audienceBuilderListPage = new AudienceBuilderListPage(page, role);
    await audienceBuilderListPage.goto();
    await audienceBuilderListPage.buildButton.click();

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
      await audienceBuilderEditPage.audienceInformation.fillCpm("2");
    });

    await test.step(`Select blended taxonomy type`, async () => {
      await audienceBuilderEditPage.audienceComposition.setCompositionType(
        "devices",
      );
      await audienceBuilderEditPage.audienceComposition.setCompositionType(
        "blended",
      );
      await expect(
        await audienceBuilderEditPage.audienceComposition.compositionType(
          "blended",
        ),
      ).toBeChecked();
    });

    await test.step(`Select Taxonomies and verify if custom taxonomy type os marked as Postal Codes`, async () => {
      await expect(
        await audienceBuilderEditPage.builderBlended.blendedTaxonomyType,
      ).toHaveValue("Postal Codes");

      selectedTaxonomies =
        await audienceBuilderEditPage.builderBlended.selectTaxonomies(2);
    });

    await test.step(`Simulate Blended Audience`, async () => {
      await audienceBuilderEditPage.builderBlended.simulateTab.click();
      await page.route(
        "*/**/audience_builder/Blended/simulate",
        async (route) => {
          await route.fulfill({ json: audienceBuilderSimulateMockJson });
        },
      );
      await audienceBuilderEditPage.builderBlended.simulateButton.click();
    });

    await test.step(`Save Audience`, async () => {
      let createResponse: Response;
      await audienceBuilderEditPage.saveButton.click();
      await page.waitForResponse(async (response) => {
        createResponse = response;
        return response.url().includes("audience_builder/Blended/create");
      });
      await page.waitForRequest((request) =>
        request.url().includes("AudienceBuilder/list"),
      );
      customAudienceId = (await createResponse!.json()).custom_audience_id;
    });

    let row: Locator;
    await test.step(`Validate if the audience is visible in the table. If so, go to edit it`, async () => {
      await audienceBuilderListPage
        .rowEditButton({ name: taxonomyName })
        .click();
      await expect(page.getByText("Edit Audience")).toBeVisible();
      audienceBuilderEditPage = new AudienceBuilderEditPage(page, role, {
        id: `${customAudienceId}`,
        type: "blended",
      });
    });

    await test.step(`Update values: CPM and Taxonomy Name`, async () => {
      await audienceBuilderEditPage.audienceInformation.fillCpm("4");
      await audienceBuilderEditPage.audienceInformation.fillTaxonomyName(
        taxonomyNameEdited,
      );
      await audienceBuilderEditPage.builderBlended.builderTab.click();
      await audienceBuilderEditPage.builderBlended.selectTaxonomies(2, {
        avoidIds: selectedTaxonomies.ids,
      });
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
