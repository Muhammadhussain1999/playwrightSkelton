import StepTwoAddInfoPage from "tests/pages/checkout/StepTwoAddInfo";
import { Page } from "@playwright/test";
import { IUserListGET } from "helpers/types/user";
import { IRole } from "fixtures/configs/roles";

export const fulfillStepTwo = async (
  page: Page,
  role: IRole,
  mock_user: IUserListGET,
) => {
  const StepTwo = new StepTwoAddInfoPage(page);
  if (role.is_employee) {
    await StepTwo.fillCustomerInfo(mock_user);
  }
  await StepTwo.goToNextStep();
  return page;
};
