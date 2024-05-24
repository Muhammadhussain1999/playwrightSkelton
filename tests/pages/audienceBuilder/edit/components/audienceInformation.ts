import { PwComponent } from "tests/pages/_configs";

export default class AudienceBuilderEditInformationComponent extends PwComponent {
  get locator() {
    return this.page
      .getByTestId("datadesk_formWrapper")
      .filter({ hasText: "Basic Information" });
  }
  get dataPartnerSelect() {
    return this.locator.getByTestId("data_partner_select");
  }

  get customerSelect() {
    return this.locator.getByTestId("customer_select");
  }

  get categorySelect() {
    return this.locator.getByLabel("Category Name *");
  }

  get segmentSelect() {
    return this.locator.getByLabel("Segment Name *");
  }

  get taxonomyNameInput() {
    return this.locator.getByLabel("Taxonomy Name *");
  }

  get cpmInput() {
    return this.locator.getByLabel("CPM *");
  }

  async selectDataPartner(dataPartnerName: string = "") {
    await this.dataPartnerSelect.getByLabel("Open").click();
    await this.page.getByRole("option", { name: dataPartnerName }).click();
  }

  async selectCustomer(customerName: string = "") {
    await this.customerSelect.getByLabel("Open").click();
    await this.page.getByLabel("Please select audience behaviour").click();
    await this.page.getByLabel("Please select audience behaviour").fill("dd");
    await this.page.getByRole("option", { name: customerName }).click();
  }

  async selectCategory(
    _categoryName: string = "",
    optionRowNumber: number = 2,
  ) {
    await this.categorySelect.click();
    await this.page.locator(`#category-option-${optionRowNumber}`).click();
  }

  async selectSegment(_segmentName: string = "", optionRowNumber: number = 4) {
    await this.segmentSelect.click();
    await this.page.locator(`#segment-option-${optionRowNumber}`).click();
  }

  async fillTaxonomyName(taxonomyName: string = "") {
    await this.taxonomyNameInput.fill(taxonomyName);
    await this.page.waitForTimeout(750);
  }

  async fillCpm(cpm: string = "") {
    await this.cpmInput.fill(cpm);
    await this.page.waitForTimeout(750);
  }
}
