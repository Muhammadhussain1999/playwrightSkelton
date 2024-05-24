import { BaseCheckoutPage } from "./baseCheckoutPage";
export default class StepOneViewOrderPage extends BaseCheckoutPage {
  get emailOfCustomer() {
    return this.page.getByTestId("buyer_email").getByLabel("E-mail *");
  }

  get customerDropdown() {
    return this.page.getByLabel("Customer *");
  }

  get nameOfCustomer() {
    return this.page.getByTestId("buyer_name").getByLabel("Name *");
  }

  async fillCustomerInfo(mock_user: any) {
    await this.nameOfCustomer.fill(
      `${mock_user.first_name} ${mock_user.last_name}`,
    );
    await this.emailOfCustomer.fill(mock_user.email);
  }
}
