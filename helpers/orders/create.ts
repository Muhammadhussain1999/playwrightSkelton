import { Browser } from "@playwright/test";
import getTaxonomies from "../taxonomies/get";
import { saveOrderMock } from "./_mock";
import { IPwFixtureRankGroups, TRankGroup } from "./types";
import { networkURLs } from "helpers/network/url";
import { samples as roles, IRoleSample } from "fixtures/configs/roles";
import { toMultiPart } from "helpers/formData";
import { onDemainFixturesBasePath } from "fixtures/config";

interface IPwOrderHelperCreateOrder
  extends Partial<Omit<typeof saveOrderMock, "segments" | "rank_filters">> {
  id?: number;
  segments?: any[];
  rank_filters?: any[];
  hash?: string;
}

interface IPwOrderHelperCreateOptions {
  order?: Partial<IPwOrderHelperCreateOrder>;
  numberOfTaxonomies?: number;
  purchase?: boolean;
  role?: IRoleSample;
}
/**
 * Helper function responsible for creating an order automatically
 * @param page Playwright page instance - cannot be used on before/after hooks
 * @param order Custom Order properties
 * @param numberOfTaxonomies Number of taxonomies that you expect to be added in the order
 * @param purchase if the order should be purchased or not
 * @returns the Custom Order properties updated
 */
export const createOrder = async (
  browser: Browser,
  options: IPwOrderHelperCreateOptions = {},
): Promise<{ order: IPwOrderHelperCreateOrder; created: boolean }> => {
  let created = false;
  const _numberOfTaxonomies = options.numberOfTaxonomies ?? 3;
  let _baseOrder: IPwOrderHelperCreateOrder = {
    ...saveOrderMock,
    name: `OrderPageTest${new Date().getTime()}`,
    ...options.order,
  };

  try {
    const rank_groups_list = (await import(
      `${onDemainFixturesBasePath}/rank_groups/list.json`
    )) as IPwFixtureRankGroups;
    const taxonomies = (await getTaxonomies({ private: false })).slice(
      0,
      _numberOfTaxonomies,
    );
    const rankGroups: TRankGroup[] = rank_groups_list?.rank_groups ?? [];
    _baseOrder.rank_filters = rankGroups
      .find((i) => i.id === _baseOrder.rank_filter_group_id)
      ?.rank_filters.map((i) => i.rank_filter_id);

    _baseOrder.segments = taxonomies;

    _baseOrder.data_partner_segment_data_versions = taxonomies.map(
      (i) => i.data_partner_segment_data_version_id,
    );

    const role = options.role ?? roles.admin;
    const context = await browser.newContext({ storageState: role?.path });
    const data = toMultiPart(_baseOrder);
    const url = `${networkURLs.apiUrl}/audiences/edit`;
    const response = await context.request.post(url, {
      multipart: data,
    });

    const status = response.ok();
    const json = await response.json();
    if (!status || !json?.audience) {
      throw new Error(
        `Order not created due to: ${json?.error ?? "unknown error"}`,
      );
    }
    created = true;
    _baseOrder = json.audience;

    const shouldPurchase =
      options.purchase !== undefined ? options.purchase : true;
    if (shouldPurchase) {
      const url = `${networkURLs.apiUrl}/audiences/edit_by_hash`;
      const dataPurchase = toMultiPart(_baseOrder);
      const responsePurchase = await context.request.post(url, {
        multipart: dataPurchase,
      });
      const statusPurchase = responsePurchase.ok();
      const jsonPurchase = await responsePurchase.json();
      if (!statusPurchase || !jsonPurchase?.proposal) {
        throw new Error(
          `Order not purchased due to: ${json?.error ?? "unknown error"}`,
        );
      }

      created = true;
      _baseOrder = jsonPurchase.proposal;

      if (!_baseOrder.hash) {
        throw new Error(`Order not purchased due to: Hash not found`);
      }
      if (!_baseOrder.id) {
        throw new Error(`Order not purchased due to: ID not found`);
      }
    }
  } catch (_e: any) {
    const e = _e as Error;
    console.error(e.message);
    console.warn(e.stack);
    created = false;
  }

  if (created) {
    const obj: any = { ..._baseOrder };
    Object.keys(obj).forEach((key) => {
      if (obj[key] === undefined || obj[key] === null) delete obj[key];
      if (typeof obj[key] === "object") {
        obj[key] = JSON.stringify(obj[key]);
      }
    });
    console.log("Order Created: ", obj);
  }
  return { order: _baseOrder, created };
};
