import { Page } from "@playwright/test";
import { IRole } from "fixtures/configs/roles";
import { PwPage } from "tests/pages/_configs";
import AudienceBuilderListBulkCreateModalComponent from "./components/BulkCreateModal";

type PathParams = {};
type AudienceRowProps = { name?: string };
export default class AudienceBuilderListPage extends PwPage<PathParams> {
  constructor(page: Page, role: IRole, pathParams?: PathParams) {
    super(page, role, pathParams);
    this.setPath(pathParams);
  }
  setPath(pathParams: PathParams = {}) {
    this.path = "/audience_builder";
  }

  get buildButton() {
    return this.page.getByTestId('build_button');
  }

  get table() {
    return this.page.locator("table");
  }

  get audienceRow() {
    return ({ name }: AudienceRowProps) => {
      const rows = this.table.locator("tbody tr");
      return rows.filter({
        has: this.page.locator("td").filter({ hasText: name }),
      });
    };
  }

  get rowEditButton() {
    return (rowProps: AudienceRowProps) => {
      return this.audienceRow(rowProps).getByTestId("edit_button");
    };
  }

  get rowDeleteButton() {
    return (rowProps: AudienceRowProps) => {
      return this.audienceRow(rowProps).getByTestId("remove_button");
    };
  }

  get confirmDeleteButton() {
    return this.page.getByRole("button", { name: "Confirm" });
  }

  get bulkCreateModal() {
    const locator = this.page.getByRole("dialog");
    return new AudienceBuilderListBulkCreateModalComponent(
      this.page,
      locator,
      this.role,
    );
  }

  async openBulkCreateModal() {
    await this.page.getByLabel("audience-builder-build-menu").click();
    await this.page
      .getByRole("menuitem", {
        name: "Create Blended Taxonomies from Excel (*.xlsx)",
      })
      .click();
  }
}
