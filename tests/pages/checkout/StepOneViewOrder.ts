import { IUserListGET } from "helpers/types/user";
import { BaseCheckoutPage } from "./baseCheckoutPage";

export default class StepOneViewOrder extends BaseCheckoutPage {
  get customerDropdown() {
    return this.page.getByLabel("Customer *");
  }

  async selectCustomer(mock_user: IUserListGET) {
    await this.customerDropdown.click();
    const customerName = mock_user.customer_name;
    const customerRole = await this.page.getByRole("option", {
      name: customerName,
    });
    await customerRole.click();
  }
}
