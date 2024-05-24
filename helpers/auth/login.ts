import { Browser } from "@playwright/test";
import { IRoleSample } from "fixtures/configs/roles";
import { networkURLs } from "helpers/network";
import { test } from "@playwright/test";
import { logout } from "./logout";
import fs from "fs";

type TLogin = (
  browser: Browser,
  options?: {
    role?: IRoleSample;
    visual?: boolean;
    test?: typeof test;
  },
) => Promise<void>;
export const login: TLogin = async (browser, options = {}): Promise<void> => {
  try {
    const { role, visual } = options;
    if (!role) {
      throw new Error("Role is required");
    }
    const fixtureExists = await fs.existsSync(role.path);
    if (fixtureExists) {
      const data = (await import(role.path)) as {
        cookies?: { name: string; expires: number; domain: string }[];
      };
      const cookie = (data?.cookies ?? []).find(
        ({ name, domain }) =>
          name === "ci_session" &&
          [networkURLs.cookiesDomain, networkURLs.apiDomain].find((d) =>
            d.includes(domain),
          ),
      );
      const expires = cookie?.expires ?? undefined;

      // For local testing, this ensures that the login runs only when the session expirations is about to end
      if (expires) {
        const expiresTimestamp = new Date(expires * 1000).getTime();
        const currentTimestamp = new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24,
        ).getTime();
        const difference_In_Time = expiresTimestamp - currentTimestamp;
        const difference_In_Days = difference_In_Time / (1000 * 3600 * 24);
        if (difference_In_Days >= 1) {
          return;
        }
      }
    }
    await logout(browser);
    console.log(`Login as: ${role.name}`);
    if (visual) {
      await _loginVisual(browser, role);
    } else {
      await _loginApi(browser, role);
    }
  } catch (e: any) {
    const message =
      e?.message ||
      `Failed to authenticate as ${options.role?.name ?? "Unknown role"}`;
    console.error(message);
    console.trace();
    if (options.test) {
      await options.test.fail(message);
      return;
    }
  }
};

const _loginApi = async (browser: Browser, role: IRoleSample) => {
  const context = await browser.newContext();
  const data = {
    sign_in_password: role.sign_in_password,
    sign_in_remember: true,
    sign_in_username_email: role.sign_in_username_email,
  };

  const url = `${networkURLs.apiUrl}/users/login`;
  const response = await context.request.post(url, { data });

  if (!response.ok()) {
    throw new Error();
  }

  await context.request.storageState({ path: role.path });

  /**
   * The following block is required to duplicate the ci_session cookie when using a feature branch
   * For some backend reason, the cookie is verified by the staging environment but also from the feature branch one
   */
  // if (networkURLs.staging) {
  //   try {
  //     const storageStateFile = await readFile(role.path);
  //     const currentStorageStage = JSON.parse(storageStateFile.toString());
  //     const ci_session_cookie = cookies.find(({ name, domain }: any) => {
  //       return name === 'ci_session' && domain === networkURLs.apiDomain;
  //     });

  //     if (ci_session_cookie) {
  //       const extra_ci_session_cookie = {
  //         ...ci_session_cookie,
  //         domain: networkURLs.cookiesDomain,
  //       };
  //       currentStorageStage.cookies.push(extra_ci_session_cookie);
  //       await writeFile(role.path, JSON.stringify(currentStorageStage, null, 4));
  //     }
  //   } catch (e: any) {
  //     throw new Error('Unable to include staging ci_session cookie');
  //   }
  // }
};

const _loginVisual = async (
  browser: Browser,
  role?: IRoleSample,
): Promise<void> => {
  if (!role) return;
  const page = await browser.newPage();
  await page.goto("");
  await page.getByTestId("header-user").click();
  await page.getByRole("menuitem", { name: "Login" }).click();
  await page.getByLabel("E-mail").click();
  await page.getByLabel("E-mail").fill(role.sign_in_username_email);
  await page.getByTestId("password").locator("path").first().click();
  await page
    .getByLabel("Password", { exact: true })
    .fill(role.sign_in_password);
  await page.getByTestId("submit").click();

  await page.waitForResponse(
    (response) =>
      response.url().includes("users/login") && response.status() === 200,
  );
  await page.waitForResponse(
    (response) => {
      return (
        response.url().includes("audiences/list_taxonomies") &&
        response.status() === 200
      );
    },
    { timeout: 1000 * 60 * 4 },
  );

  await page.context().storageState({ path: role.path });
};
