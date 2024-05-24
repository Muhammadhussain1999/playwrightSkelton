import { Browser } from "@playwright/test";
import { samples as roles } from "fixtures/configs/roles";
import { networkURLs } from "helpers/network";
import config from "./_config";
import fs from "fs";
import {
  TPwTaxonomiesHelperListResponse,
  IPwTaxonomiesHelperListOptions,
  IPwTaxonomiesHelperListFixtureTaxonomies,
  IPwTaxonomiesHelperListFixtureSegments,
  TTaxonomy,
} from "./_types";

/**
 * Get the list of taxonomies available through an API request - does not require visual
 * @param browser the playwright browser instance being used - can be used during before/after hooks
 * @param options request options
 * @returns An instance of Playwright's APIResponse class
 */
export default async (
  browser: Browser,
  options?: Partial<IPwTaxonomiesHelperListOptions>,
): Promise<TPwTaxonomiesHelperListResponse> => {
  // Create a new APIRequestContext
  const listResponse: TPwTaxonomiesHelperListResponse = {
    taxonomies: [],
    segments: [],
  };
  const context = await browser.newContext({
    storageState: roles?.admin?.path,
  });

  const taxonomiesBasePath = config.taxonomies.basePath;
  const taxonomiesPath = config.taxonomies.filePath;
  const taxonomiesFixtureExists = await fs.existsSync(taxonomiesPath);
  let shouldUpdateTaxonomies = !taxonomiesFixtureExists;
  if (!shouldUpdateTaxonomies) {
    const dataTax = (await import(
      taxonomiesPath
    )) as IPwTaxonomiesHelperListFixtureTaxonomies;
    if (dataTax.server !== networkURLs.apiUrl) {
      shouldUpdateTaxonomies = true;
    } else if (dataTax.timestamp < new Date().getTime() - 1000 * 60 * 60 * 24) {
      shouldUpdateTaxonomies = true;
    }

    // If the file exists and it's outdated, delete it
    if (shouldUpdateTaxonomies) {
      await fs.unlinkSync(taxonomiesPath);
    } else {
      listResponse.taxonomies = dataTax.taxonomies;
    }
  }

  const segmentBasePath = config.segments.basePath;
  const segmentsPath = config.segments.filePath;
  const segmentsFixtureExists = await fs.existsSync(segmentsPath);
  let shouldUpdateSegments = !segmentsFixtureExists;
  if (!shouldUpdateSegments) {
    const dataSeg = (await import(
      segmentsPath
    )) as IPwTaxonomiesHelperListFixtureSegments;
    if (dataSeg.server !== networkURLs.apiUrl) {
      shouldUpdateSegments = true;
    } else if (dataSeg.timestamp < new Date().getTime() - 1000 * 60 * 60 * 24) {
      shouldUpdateSegments = true;
    }

    // If the file exists and it's outdated, delete it
    if (shouldUpdateSegments) {
      await fs.unlinkSync(segmentsPath);
    } else {
      listResponse.segments = dataSeg.segments;
    }
  }

  if (!options?.update && !shouldUpdateSegments && !shouldUpdateTaxonomies) {
    return listResponse;
  }

  const data = {};
  const url = `${networkURLs.apiUrl}/audiences/list_taxonomies`;

  const response = await context.request.post(url, { data });

  const json = await response.json();
  if (!json?.taxonomies?.length) {
    throw new Error("No taxonomies found");
  }

  if (!json?.segments?.length) {
    throw new Error("No segments found");
  }

  // Check if the file exists and if it's outdated
  const taxonomiesJson: IPwTaxonomiesHelperListFixtureTaxonomies = {
    timestamp: new Date().getTime(),
    server: networkURLs.apiUrl,
    // sort taxonomies by `devices` property DESC
    taxonomies: (json.taxonomies as TTaxonomy[]).sort(
      (a, b) => b.devices - a.devices,
    ),
  };

  if (!fs.existsSync(taxonomiesBasePath)) {
    fs.mkdirSync(taxonomiesBasePath, { recursive: true });
  }

  await fs.writeFileSync(
    taxonomiesPath,
    JSON.stringify(taxonomiesJson, null, 2),
  );

  /**
   * Apply same rule for segments
   */

  // Check if the file exists and if it's outdated
  const segmentsJson: IPwTaxonomiesHelperListFixtureSegments = {
    timestamp: new Date().getTime(),
    server: networkURLs.apiUrl,
    segments: json.segments,
  };

  if (!fs.existsSync(segmentBasePath)) {
    fs.mkdirSync(segmentBasePath, { recursive: true });
  }

  await fs.writeFileSync(segmentsPath, JSON.stringify(segmentsJson, null, 2));

  listResponse.taxonomies = taxonomiesJson.taxonomies;
  listResponse.segments = segmentsJson.segments;
  return listResponse;
};
