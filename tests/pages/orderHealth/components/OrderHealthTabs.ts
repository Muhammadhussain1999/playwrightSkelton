import { PwComponent } from "tests/pages/_configs";
import { Tabs } from "../types";
import OrderHealthTabsTaxonomiesComponent from "./TaxonomiesTab";
import OrderHealthTabsFilesComponent from "./FilesTab";
import OrderHealthTabsCronLogsComponent from "./CronLogsTab";

export default class OrderHealthTabsComponent extends PwComponent {
  readonly tabs = Tabs;
  get locator() {
    return this.page.locator("div").filter({ has: this.headers });
  }

  get headers() {
    const combinedText = this.tabs.reduce((acc, { label }) => acc + label, "");
    return this.page
      .getByRole("tablist")
      .filter({ has: this.page.getByText(combinedText) })
      .getByRole("tab");
  }

  get wrapper() {
    return this.page.locator("div").filter({ has: this.headers });
  }

  get currentTab() {
    return this.wrapper.getByRole("tabpanel").filter({ hasText: /.+/ });
  }

  get taxonomiesTab() {
    const locator = this.wrapper
      .getByRole("tabpanel")
      .nth(Tabs.findIndex(({ id }) => id === "taxonomies"));
    return new OrderHealthTabsTaxonomiesComponent(
      this.page,
      locator,
      this.role,
    );
  }
  get filesTab() {
    const locator = this.wrapper
      .getByRole("tabpanel")
      .nth(Tabs.findIndex(({ id }) => id === "files"));
    return new OrderHealthTabsFilesComponent(this.page, locator, this.role);
  }
  get logsTab() {
    const locator = this.wrapper
      .getByRole("tabpanel")
      .nth(Tabs.findIndex(({ id }) => id === "cron-logs"));
    return new OrderHealthTabsCronLogsComponent(this.page, locator, this.role);
  }

  async goToTab(tabName: (typeof Tabs)[number]["label"]) {
    await this.headers.getByText(tabName).click();
  }
}
