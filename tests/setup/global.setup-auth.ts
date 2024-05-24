import {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  test as setup,
} from "@playwright/test";
import { samples as roles, IRoleSample } from "fixtures/configs/roles";
import { login } from "helpers/auth";

/**
 * This test runs as serial because the listing of resources requires the authentication
 */
setup.describe("Authentication", () => {
  setup.beforeAll(async ({ playwright: _p }, testInfo) => {
    /**
     * prompt the following information for debugging supporting
     * change this to improve developer experience
     */
    const infoSettings: Partial<typeof process.env> = {
      APPV2_URL: process.env.APPV2_URL,
      BASE_URL: process.env.BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      ENV: process.env.ENV,
    };

    !testInfo.workerIndex && console.table(infoSettings);
  });
  setup(`Authenticate as ${roles.admin.alias}`, setupAuth(roles.admin));
  setup(
    `Authenticate as ${roles.datadesk_admin.alias}`,
    setupAuth(roles.datadesk_admin),
  );
  setup(
    `Authenticate as ${roles.datadesk_user.alias}`,
    setupAuth(roles.datadesk_user),
  );
});

type TSetup = (
  args: PlaywrightTestArgs &
    PlaywrightTestOptions &
    PlaywrightWorkerArgs &
    PlaywrightWorkerOptions,
) => Promise<void>;
type TSetupParams = PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions;

function setupAuth(role: IRoleSample): TSetup {
  return async ({ browser }: TSetupParams) => {
    await login(browser, { role, test: setup });
  };
}
