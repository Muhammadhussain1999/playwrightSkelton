import { Locator, Page } from "@playwright/test";
import { IRole } from "fixtures/configs/roles";
import { PwComponent } from "tests/pages/_configs";

export default class AudienceBuilderListBulkCreateModalComponent extends PwComponent {
  private _locator: Locator;

  constructor(page: Page, locator: Locator, role?: IRole) {
    super(page, role);
    this._locator = locator;
  }

  get locator() {
    return this._locator;
  }

  get fileUploader() {
    return this.locator.getByRole("button", {
      name: "Click to upload Excel files (*.xlsx)",
    });
  }

  get alert() {
    return this.locator.getByTestId("alert-component");
  }

  get table() {
    return this.locator.getByTestId(
      "datadesk-table-paper-root-datadesk-audience-builder-bulk-create-table",
    );
  }

  get tableHeaders() {
    return this.table.locator("thead th");
  }

  get tableRows() {
    return this.table.locator("tbody tr");
  }

  get closeButton() {
    return this.locator.getByTestId('datadesk-audience-builder-bulk-create-actions').getByRole('button', { name: 'Close' });
  }

  get buildButton() {
    return this.locator.getByRole("button", { name: "Build" });
  }

  async setFile(fileFixturePath?: string) {
    const responsePromise = this.page.waitForResponse(
      "*/**/audience_builder/Blended/bulk_create",
    );

    let file =
      fileFixturePath ||
      `fixtures/upload/audience_builder/bulk_create_valid.csv`;
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.fileUploader.click();
    await this.fileUploader.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);

    const response = await responsePromise;
    return response;
  }

  async buildTaxonomies() {
    const responsePromise = this.page.waitForResponse(
      "*/**/audience_builder/Blended/bulk_create",
    );
    await this.buildButton.click();
    const response = await responsePromise;
    return response;
  }
}
