import { Browser, test } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";

import { networkURLs } from "helpers/network";
import { IAdvertiserGET } from "helpers/types/advertiser";
import { toMultiPart } from "helpers/formData";

interface ISetupWhitelabelDependenciesOptions {
  test?: typeof test;
  advertiser_id?: number;
}

/**
 * Get the list of taxonomies available through an API request - does not require visual
 * @param browser the playwright browser instance being used - can be used during before/after hooks
 * @param options request options
 * @returns An instance of Playwright's APIResponse class
 */
export default async (
  browser: Browser,
  { test, advertiser_id }: ISetupWhitelabelDependenciesOptions = {},
): Promise<void> => {
  try {
    // Create a new APIRequestContext with the admin's storage state
    const context = await browser.newContext({
      storageState: roles?.admin?.path,
    });

    const baseUrl = new URL(process.env.BASE_URL || "");
    const hostname = baseUrl.hostname;

    if (!advertiser_id) {
      throw new Error(`Missing whitelabel customer ID to setup dependencies`);
    }

    // get the whitelabel customer
    let url = `${networkURLs.apiUrl}/advertisers/get?id=${advertiser_id}`;
    const response = await context.request.get(url);
    const json = await response.json();

    if (!json.advertiser) {
      throw new Error(
        `Failed to get whitelabel customer with ID ${advertiser_id}`,
      );
    }

    const advertiser: IAdvertiserGET = json.advertiser;
    if (
      advertiser.is_white_label_customer &&
      advertiser.white_label_domain &&
      advertiser.white_label_domain === hostname
    ) {
      console.log(`Whitelabel customer with ID ${advertiser_id} already setup`);
      return;
    }

    advertiser.is_white_label_customer = 1;
    advertiser.white_label_domain = hostname;

    const data = toMultiPart(advertiser);
    url = `${networkURLs.apiUrl}/advertisers/edit`;
    const responseEdit = await context.request.post(url, { multipart: data });

    const jsonEdit = await responseEdit.json();
    if (jsonEdit?.status !== "success") {
      throw new Error(
        `Failed to update whitelabel customer with ID ${advertiser_id}`,
      );
    }
    console.log(
      `Whitelabel customer with ID ${advertiser_id} updated successfully`,
    );
  } catch (e: any) {
    const message = e?.message || `Failed to setup whitelabel dependencies`;
    console.error(message);
    e?.stack ? console.log(e.stack) : console.trace();
    if (test) {
      await test.fail(message);
      return;
    }
  }
};
