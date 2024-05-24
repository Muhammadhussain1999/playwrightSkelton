import { Page } from "@playwright/test";
import { IRole } from "fixtures/configs/roles";
import { PwPage } from "tests/pages/_configs";
import AudienceBuilderEditInformationComponent from "./components/audienceInformation";
import AudienceBuilderEditCompositionComponent from "./components/audienceComposition";
import AudienceBuilderEditBlendedComponent from "./components/builderBlended";
import AudienceBuilderEditDevicesComponent from "./components/builderDevices";
import AudienceBuilderEditPostalCodesComponent from "./components/builderPostalCodes";

type PathParams = { id?: string; type?: AudienceTypes };
type AudienceTypes = "blended" | "devices" | "postal_codes" | undefined;

export default class AudienceBuilderEditPage extends PwPage<PathParams> {
  protected audienceType: AudienceTypes;

  constructor(page: Page, role?: IRole, pathParams?: PathParams) {
    super(page, role, pathParams);
    this.audienceType = pathParams?.type;
    this.setPath(pathParams);
  }

  setPath({ id, type }: PathParams = {}) {
    if (id && type) {
      this.path = `/audience_builder/edit/${type}/${id}`;
    } else {
      this.path = "/audience_builder/edit";
    }
  }

  get audienceInformation() {
    return new AudienceBuilderEditInformationComponent(this.page, this.role);
  }

  get audienceComposition() {
    return new AudienceBuilderEditCompositionComponent(this.page, this.role);
  }

  get builderBlended() {
    return new AudienceBuilderEditBlendedComponent(this.page, this.role);
  }

  get builderDevices() {
    return new AudienceBuilderEditDevicesComponent(this.page, this.role);
  }

  get builderPostalCodes() {
    return new AudienceBuilderEditPostalCodesComponent(this.page, this.role);
  }

  get saveButton() {
    return this.page
      .locator("#pagesheet-wrapper-head")
      .getByTestId("save_button");
  }

  async setTab(tab: "map" | Exclude<AudienceTypes, undefined>) {
    await this.page.locator(`#datadesk-tab-${tab}`).click();
  }
}
