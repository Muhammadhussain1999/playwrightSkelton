import { PwComponent } from "tests/pages/_configs";

type CompositionType = "blended" | "devices" | "postal_codes" | undefined;
const compositionTypeCheckbox = {
  blended: "Create an audience by blending pre-existing postal code taxonomies",
  devices: "Create an audience by uploading a list of devices",
  postal_codes: "Create an audience by uploading a list of postal codes",
};

export default class AudienceBuilderEditCompositionComponent extends PwComponent {
  private _type: CompositionType;

  get type() {
    return this._type;
  }

  get locator() {
    return this.page
      .getByTestId("datadesk_formWrapper")
      .filter({ hasText: "Audience Composition" });
  }

  get compositionType() {
    return (type: CompositionType) => {
      if (!type || !compositionTypeCheckbox[type]) {
        return this.locator.getByLabel("");
      }
      return this.locator.getByLabel(compositionTypeCheckbox[type]);
    };
  }

  async setCompositionType(type: CompositionType) {
    if (!type || !compositionTypeCheckbox[type]) {
      return;
    }

    await this.locator.getByLabel(compositionTypeCheckbox[type]).check();

    this._type = type;
  }
}
