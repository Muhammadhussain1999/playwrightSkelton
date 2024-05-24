import { Locator, type Page } from "@playwright/test";
import { IRole } from "fixtures/configs/roles";

interface PwBasePageComponentArgs {
  readonly page: Page;
  readonly role?: IRole;
}

export interface PwPageArgs<PwPagePathParamenter = string>
  extends PwBasePageComponentArgs {
  setPath(value: PwPagePathParamenter): void;
}

export interface PwComponentArgs extends PwBasePageComponentArgs {
  locator: Locator;
}

export class PwPage<PwPagePathParamenter = String>
  implements PwPageArgs<PwPagePathParamenter>
{
  readonly page: Page;
  readonly role?: IRole;
  protected _path: string = "/";

  constructor(page: Page, role?: IRole, path?: PwPagePathParamenter) {
    this.page = page;
    this.role = role;
  }

  setPath(value: PwPagePathParamenter): void {
    this.path = `${value}`;
  }

  set path(value: string) {
    this._path = `${value}`;
  }

  get path() {
    return this._path;
  }

  async goto(options?: Parameters<Page["goto"]>[1]) {
    await this.page.goto(this.path, options);
  }
}

export class PwComponent implements PwComponentArgs {
  readonly page: Page;
  readonly role?: IRole;

  constructor(page: Page, role?: IRole) {
    this.page = page;
    this.role = role;
  }

  get locator() {
    return this.page.locator("");
  }
}
