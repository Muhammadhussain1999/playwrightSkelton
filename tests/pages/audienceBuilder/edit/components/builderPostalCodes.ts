import AudienceBuilderEditBaseBuilderComponent from "./baseBuilder";

export default class AudienceBuilderEditPostalCodesComponent extends AudienceBuilderEditBaseBuilderComponent {
  constructor(page: any, role: any) {
    super(page, role);
    this.builderTabId = "datadesk-tab-postal_codes";
  }
}
