import { Locator, Page } from "@playwright/test";
import { IRole } from "fixtures/configs/roles";
import { PwComponent } from "tests/pages/_configs";

export default class OrderHealthTabsFilesComponent extends PwComponent {
  private _locator: Locator;

  constructor(page: Page, locator: Locator, role?: IRole) {
    super(page, role);
    this._locator = locator;
  }

  get locator() {
    return this._locator;
  }

  get table() {
    return this.locator.locator("table");
  }

  get tableHeaders() {
    return this.table.locator("th");
  }

  get tableRows() {
    return this.table.locator("tbody > tr");
  }
}
