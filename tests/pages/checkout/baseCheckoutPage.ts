import { PwPage } from "../_configs";

export class BaseCheckoutPage extends PwPage {
  get nextButton() {
    return this.page.getByTestId("datadesk-order-actions-top-next");
  }

  get previousButton() {
    return this.page.getByTestId("datadesk-order-actions-top-previous");
  }

  async goToNextStep() {
    await this.nextButton.click();
  }

  async goToPreviousStep() {
    await this.previousButton.click();
  }
}
