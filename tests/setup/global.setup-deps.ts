import {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  test as setup,
} from "@playwright/test";
import listTaxonomies from "helpers/taxonomies/list";
import listUsers from "helpers/users/setup";
import getOrder from "helpers/orders/get";
import whitelabelSetup from "helpers/whitelabel/setup";

/**
 * This test runs as serial because the listing of resources requires the authentication
 */
setup.describe("Dependencies", () => {
  setup(`List Taxonomies and Segments`, setupTaxonomiesAndSegments());
  setup(
    `List Data Partners, Sources, Publishers and Rank Groups`,
    setupDataPartnersAndPublishers(),
  );
  setup(`Get User fixtures`, setupUser());
  setup(`Ensure Whitelabel has dependencies`, setupWhitelabelDependencies());
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

function setupTaxonomiesAndSegments(): TSetup {
  return async ({ browser }: TSetupParams) => {
    await listTaxonomies(browser);
  };
}

function setupUser(): TSetup {
  return async ({ browser }: TSetupParams) => {
    await listUsers(browser);
  };
}

function setupDataPartnersAndPublishers(): TSetup {
  return async ({ browser }: TSetupParams) => {
    await getOrder(browser, { storeAsAFixture: true });
  };
}

function setupWhitelabelDependencies(): TSetup {
  return async ({ browser }: TSetupParams) => {
    const advertiser_id = parseInt(process.env.WHITELABEL_CUSTOMER_ID ?? "");
    if (!process.env.WHITELABEL_CUSTOMER_ID) {
      setup.skip(!process.env.WHITELABEL_CUSTOMER_ID, "No Whitelabel Provided");
      return;
    }

    if (isNaN(advertiser_id)) {
      setup.fail(isNaN(advertiser_id), "Invalid Whitelabel ID Provided");
      return;
    }

    await whitelabelSetup(browser, { test: setup, advertiser_id });
  };
}
