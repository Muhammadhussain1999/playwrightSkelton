import { Browser } from "@playwright/test";
import { networkURLs } from "helpers/network";

type TLogout = (browser: Browser) => Promise<void>;
export const logout: TLogout = async (browser) => {
  const context = await browser.newContext();
  const url = `${networkURLs.apiUrl}/users/sign_out`;
  await context.request.get(url);
};
