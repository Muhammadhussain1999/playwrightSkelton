import { type Page } from "@playwright/test";
import getTaxomies from "helpers/taxonomies/get";
import { TTaxonomy } from "helpers/taxonomies/_types";

export interface ISelectTaxonomiesOptions {
  avoidIds?: number[];
}
const baseSelectTaxonomiesOptions: ISelectTaxonomiesOptions = {
  avoidIds: [],
};
export const selectTaxonomies = async (
  page: Page,
  numberOfTaxonomies = 0,
  options: ISelectTaxonomiesOptions = {},
): Promise<{ ids: number[]; privateIdsExisting: TTaxonomy[] }> => {
  const { avoidIds } = { ...baseSelectTaxonomiesOptions, ...options };

  const idsSelected = [];

  const taxonomies = await getTaxomies();
  const top150 = taxonomies.slice(0, 150);

  const shuffled = top150
    .sort(() => 0.5 - Math.random())
    .filter(
      ({ id, private: isPrivate }) => !avoidIds?.includes(id) && !isPrivate,
    )
    .slice(0, numberOfTaxonomies + (avoidIds?.length ?? 0));

  for (const { id } of shuffled) {
    if (avoidIds?.includes(id)) {
      continue;
    }
    await page.locator(`#checkbox-input-${id}`).check();
    idsSelected.push(id);
  }

  const privateIdsExisting = top150.filter(
    ({ private: isPrivate }) => !!isPrivate,
  );

  return { ids: idsSelected, privateIdsExisting };
};

export const selectPrivateTaxonomies = async (
  page: Page,
  numberOfTaxonomies = 0,
  advertiser_id = 638,
): Promise<{ ids: number[] }> => {
  const idsSelected = [];

  const taxonomies = await getTaxomies();
  const top150 = taxonomies.slice(0, 150);
  const privateTaxonomies = top150.reduce<TTaxonomy[]>((acc, curr) => {
    if (
      curr.private &&
      curr.private_advertiser_ids
        ?.map((i) => `${i}`)
        .includes(`${advertiser_id}`)
    ) {
      acc.push(curr);
    }
    return acc;
  }, []);

  const shuffled = privateTaxonomies
    .sort(() => 0.5 - Math.random())
    .slice(0, numberOfTaxonomies);

  for (const { id } of shuffled) {
    await page.locator(`#checkbox-input-${id}`).check();
    idsSelected.push(id);
  }

  return { ids: idsSelected };
};

export const returnRandomTaxonomies = async (
  page: Page,
  numberOfTaxonomies = 0,
): Promise<{ ids: any[] }> => {
  const idsSelected = [];

  const taxonomies = await getTaxomies();
  const top150 = taxonomies.slice(0, 150);

  const shuffled = top150
    .sort(() => 0.5 - Math.random())
    .slice(0, numberOfTaxonomies);

  for (const { id } of shuffled) {
    idsSelected.push(id.toString());
  }
  return { ids: idsSelected };
};
