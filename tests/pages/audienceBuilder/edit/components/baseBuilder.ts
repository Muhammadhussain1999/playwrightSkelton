import { PwComponent } from "tests/pages/_configs";

export default class AudienceBuilderEditBaseBuilderComponent extends PwComponent {
  protected builderTabId: string = "";

  get locator() {
    return this.page
      .getByTestId("datadesk_formWrapper")
      .filter({ hasText: "Create Audience" });
  }

  get simulateTab() {
    return this.locator.getByTestId("datadesk-tab-map");
  }

  get builderTab() {
    return this.locator.getByTestId(this.builderTabId);
  }

  get simulateButton() {
    return this.locator.getByRole("button", {
      name: "Simulate Custom Audience",
    });
  }

  get fileUploader() {
    if (this.builderTabId === "datadesk-tab-blended") {
      return this.locator.getByTestId("NotImplementedFeatures");
    }

    return this.page.getByRole("button", {
      name: "Drag and drop or click to select a CSV/ZIP file to upload.",
    });
  }

  async setFile(fileFixturePath: string = "") {
    let file = `fixtures/upload/audience_builder/${this.builderTabId}.csv`;
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.fileUploader.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(fileFixturePath || file);
  }
}
