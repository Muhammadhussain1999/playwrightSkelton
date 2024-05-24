import { PwPage } from "tests/pages/_configs";
import SearchListTaxonomiesFilterComponent from "./components/filter";

export class SearchPage extends PwPage {
  protected _path: string = "/search";
  get cartHeader() {
    return this.page.getByTestId("header-cart");
  }

  get filters() {
    return new SearchListTaxonomiesFilterComponent(this.page, this.role);
  }

  get checkoutButton() {
    return this.page.getByTestId("cart-checkout");
  }

  async goToCheckout() {
    await this.cartHeader.click();
    await this.checkoutButton.click();
  }
}

export default SearchPage;
