import { Browser } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import { networkURLs } from "helpers/network";
import config from "./_config";
import fs from "fs";
import {
  IPwOrderGetHelperApiResponse,
  IPwOrderGetHelperListOptions,
  Action,
  TDataPartner,
  TDataPartnerSource,
  TPublisher,
  TRankGroup,
} from "./types";

/**
 * Get the list of taxonomies available through an API request - does not require visual
 * @param browser the playwright browser instance being used - can be used during before/after hooks
 * @param options request options
 * @returns An instance of Playwright's APIResponse class
 */
export default async (
  browser: Browser,
  options?: Partial<IPwOrderGetHelperListOptions>,
): Promise<IPwOrderGetHelperApiResponse> => {
  // Create a new APIRequestContext
  const updated = await Promise.all([
    requiresUpdate<TDataPartner>("data_partners"),
    requiresUpdate<TDataPartnerSource>("data_partners_sources"),
    requiresUpdate<TPublisher>("publishers"),
    requiresUpdate<TRankGroup>("rank_groups"),
  ]);

  if (!updated.some((i) => i === undefined || !i.key || !i.list)) {
    return updated.reduce((acc, i: any) => {
      if (i?.key && i?.list) {
        acc[i.key] = i.list;
      }
      return acc;
    }, {} as any);
  }

  const context = await browser.newContext({
    storageState: roles?.admin?.path,
  });
  const url = `${networkURLs.apiUrl}/audiences/get?is_datadesk=true&datadesk=1`;
  const response = await context.request.get(url);

  let json = await response.json();
  if (!json?.rank_groups?.length) {
    throw new Error("No Rank Groups found");
  }

  if (!json?.publishers?.length) {
    throw new Error("No Publishers found");
  }

  if (!json?.data_partners?.length) {
    throw new Error("No Data Partners found");
  }

  if (!json?.data_partners_sources?.length) {
    throw new Error("No Data Partners Source found");
  }

  json = { ...json } as IPwOrderGetHelperApiResponse;
  if (options?.storeAsAFixture) {
    await storeAsAFixture<TDataPartner>("data_partners", json.data_partners);
    await storeAsAFixture<TDataPartnerSource>(
      "data_partners_sources",
      json.data_partners_sources,
    );
    await storeAsAFixture<TPublisher>("publishers", json.publishers);
    await storeAsAFixture<TRankGroup>("rank_groups", json.rank_groups);
  }

  return json;
};

async function storeAsAFixture<T>(
  action: Action,
  list: T[],
): Promise<undefined | T[]> {
  try {
    const basePath = config[action].basePath;
    const path = config[action].filePath;
    const fileJson = {
      timestamp: new Date().getTime(),
      server: networkURLs.apiUrl,
      [action]: list,
    };

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    await fs.writeFileSync(path, JSON.stringify(fileJson, null, 2));
  } catch (_e: any) {
    return undefined;
  }
  return list;
}

async function requiresUpdate<T>(
  id: Action,
): Promise<undefined | { key: Action; list: T[] }> {
  const path = config[id].filePath;
  const fixtureExists = await fs.existsSync(path);
  let shouldUpdateRes = !fixtureExists;

  // Check if the file exists and if it's outdated
  if (!shouldUpdateRes) {
    const data = await import(path);
    if (data.server !== networkURLs.apiUrl) {
      shouldUpdateRes = true;
    } else if (data.timestamp < new Date().getTime() - 1000 * 60 * 60 * 24) {
      shouldUpdateRes = true;
    }

    // If the file exists and it's outdated, delete it
    if (shouldUpdateRes) {
      await fs.unlinkSync(path);
    } else {
      return { key: id, list: data[id] as T[] };
    }
  }
  return undefined;
}
