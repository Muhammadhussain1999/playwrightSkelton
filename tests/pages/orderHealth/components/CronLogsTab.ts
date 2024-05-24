import { Locator, Page } from "@playwright/test";
import { IRole } from "fixtures/configs/roles";
import { PwComponent } from "tests/pages/_configs";

export default class OrderHealthTabsCronLogsComponent extends PwComponent {
  private _locator: Locator;

  constructor(page: Page, locator: Locator, role?: IRole) {
    super(page, role);
    this._locator = locator;
  }

  get locator() {
    return this._locator;
  }
}
