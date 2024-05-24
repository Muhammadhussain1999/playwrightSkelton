import { Page } from "@playwright/test";
import { IRole } from "fixtures/configs/roles";
import { PwPage } from "tests/pages/_configs";
import { PathParams, DSPs, PageParams } from "./types";
import OrderHealthTabsComponent from "./components/OrderHealthTabs";

export class OrderHealthPage extends PwPage<PathParams> {
  protected _path: string = "/admin/health/";
  publisher?: (typeof DSPs)[number];

  constructor(
    page: Page,
    role?: IRole,
    pathParams?: PathParams,
    pageParams?: PageParams,
  ) {
    super(page, role, pathParams);

    this.setPath(pathParams);
    this.publisher = DSPs.find(({ id }) => id === pageParams?.dspId);
  }

  setPath({ orderId }: PathParams = {}) {
    this._path = `/admin/health/${orderId ?? ""}`;
  }

  private get pagesheetRootContent() {
    return this.page.locator("#pagesheet-root-content");
  }

  get orderInfoSection() {
    return this.pagesheetRootContent.getByTestId("health-check-base-info");
  }

  get orderDspSection() {
    return this.pagesheetRootContent.getByTestId("dsp-information");
  }

  get orderDspFields() {
    return this.orderDspSection
      .locator('[data-cy^="dsp-information-"]')
      .filter({ has: this.page.getByTestId(/^.+-(title|value)$/) })
      .filter({ hasText: /.+/ });
  }

  get tabs() {
    return new OrderHealthTabsComponent(this.page, this.role);
  }

  async getParsedOrderDspFields() {
    const parsedFields: { [key: string]: string | null } = {};
    const fields = await this.orderDspFields.all();
    for (const field of fields) {
      const label = await field.getByTestId(/.*(-title)$/).textContent();
      const value = await field.getByTestId(/.*(-value)$/).textContent();
      if (label || value) {
        const key = (label ?? "unknown").replace(/:\s*$/, "");
        parsedFields[key] = value;
      }
    }

    return parsedFields;
  }
}

export default OrderHealthPage;
