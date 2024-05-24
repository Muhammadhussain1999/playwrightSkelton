import AudienceBuilderEditBaseBuilderComponent from "./baseBuilder";

export default class AudienceBuilderEditDevicesComponent extends AudienceBuilderEditBaseBuilderComponent {
  constructor(page: any, role: any) {
    super(page, role);
    this.builderTabId = "datadesk-tab-devices";
  }
}
