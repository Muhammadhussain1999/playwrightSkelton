import config from "./_config";
import fs from "fs";
import { IPwTaxonomiesHelperListFixtureTaxonomies, TTaxonomy } from "./_types";

/**
 * Get the taxonomies
 * @param options request options
 * @returns An instance of Playwright's APIResponse class
 */
export default async ({
  ids,
  private: onlyPrivate,
  advertiserId,
}: { ids?: number[]; private?: boolean; advertiserId?: number } = {}): Promise<
  TTaxonomy[]
> => {
  if (!fs.existsSync(config.taxonomies.filePath)) {
    return [];
  }

  const data = (await import(
    config.taxonomies.filePath
  )) as IPwTaxonomiesHelperListFixtureTaxonomies;

  if (!data?.taxonomies?.length) {
    return [];
  }

  if (!ids?.length && onlyPrivate === undefined) {
    return data.taxonomies;
  }

  return (data.taxonomies as TTaxonomy[]).filter(
    ({ id, private: isPrivate, private_advertiser_ids }) => {
      let isValid = true;
      if (ids?.length) {
        isValid = ids.includes(id);
      }

      if (!isValid) {
        return isValid;
      }

      if (onlyPrivate !== undefined) {
        isValid = !!isPrivate === onlyPrivate;
      }

      if (isValid && advertiserId) {
        isValid = !!private_advertiser_ids?.includes(advertiserId);
      }

      return isValid;
    },
  );
};
