import { PwComponent } from "tests/pages/_configs";

export default class SearchListTaxonomiesFilterComponent extends PwComponent {
  get locator() {
    return this.page.getByTestId("datadesk-grid").filter({
      has: this.page
        .getByTestId("datadesk-typography")
        .filter({ hasText: "Search Parameter" }),
    });
  }
  get dataPartnerSelect() {
    return this.locator.getByLabel("Filter By Data Sources");
  }

  get categorySelect() {
    return this.locator.getByLabel("Filter By Categories");
  }

  get segmentSelect() {
    return this.locator.getByLabel("Filter By Segments");
  }
}
