import StepOneViewOrderPage from "tests/pages/checkout/StepOneViewOrder";
import { Page } from "@playwright/test";
import { IUserListGET } from "helpers/types/user";
import { IRole } from "fixtures/configs/roles";

export const fulfillStepOne = async (
  page: Page,
  role: IRole,
  mock_user: IUserListGET,
) => {
  const StepOne = new StepOneViewOrderPage(page, role);
  if (role.is_employee) {
    await StepOne.selectCustomer(mock_user);
  }
  await StepOne.goToNextStep();
  return page;
};
