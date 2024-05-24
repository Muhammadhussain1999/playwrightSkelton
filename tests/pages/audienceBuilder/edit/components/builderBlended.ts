import AudienceBuilderEditBaseBuilderComponent from "./baseBuilder";
import { selectTaxonomies } from "helpers/listTaxonomies";

export default class AudienceBuilderEditBlendedComponent extends AudienceBuilderEditBaseBuilderComponent {
  constructor(page: any, role: any) {
    super(page, role);
    this.builderTabId = "datadesk-tab-blended";
  }

  get blendedTaxonomyType() {
    return this.locator
      .getByTestId("audience_blended_taxonomy_type")
      .locator("input");
  }

  async selectTaxonomies(
    numberOfTaxonomies: Parameters<typeof selectTaxonomies>[1],
    options?: Parameters<typeof selectTaxonomies>[2],
  ) {
    const selectedTaxonomies = await selectTaxonomies(
      this.page,
      numberOfTaxonomies,
      options,
    );
    return selectedTaxonomies;
  }
}
