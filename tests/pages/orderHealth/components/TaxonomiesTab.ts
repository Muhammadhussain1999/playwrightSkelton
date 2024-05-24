import { Locator, Page } from "@playwright/test";
import { IRole } from "fixtures/configs/roles";
import { PwComponent } from "tests/pages/_configs";

export default class OrderHealthTabsTaxonomiesComponent extends PwComponent {
  private _locator: Locator;

  constructor(page: Page, locator: Locator, role?: IRole) {
    super(page, role);
    this._locator = locator;
  }

  get locator() {
    return this._locator;
  }

  get taxonomiesTable() {
    return this.locator.getByTestId("taxonomies-table-taxonomies-tab");
  }

  get audienceInformationPaper() {
    return this.locator
      .getByTestId("datadesk-paper")
      .filter({ hasText: "Audience Information" });
  }

  get tabs() {
    return this.locator.getByRole("tab");
  }

  get SyncHistoryTab() {
    return this.locator.getByTestId(
      "datadesk-table-paper-root-sync_status_history-table-sync_status_history-tab",
    );
  }

  get ErrorsTab() {
    return this.locator.getByTestId(
      "datadesk-table-paper-root-errors-table-errors-tab",
    );
  }

  async goToTab(tabName: "Errors" | "Sync History") {
    await this.tabs.getByText(tabName).click();
  }
}
