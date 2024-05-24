import { IPwFixtureBase } from "../types/_config";

export type TTaxonomy = {
  id: number;
  data_partner_segment_id: number;
  data_partner_segment_category_id: string;
  name: string;
  data_partner_id: number;
  private: number;
  private_data_partner_id: null | number;
  private_advertiser_ids: null | number[];
  data_partner_promoted_flag: number;
  total_devices_by_region: never[];
  region: string;
  type: string;
  rank_group_name: string;
  category_name: string;
  category_id: number;
  source_name: string;
  source_id: number;
  devices: number;
  segment_total_id: number;
  cost_cpm_currency_symbol: string;
  cost_per_cpm: number;
  data_partner_cpm: number;
  data_partner_segment_data_version_id: number;
  is_dissemination_area: any;
  taxonomy_code: string;
  data_partner_name: string;
};

export interface IPwTaxonomiesHelperListOptions {
  update?: boolean;
}

export type TPwTaxonomiesHelperListResponse =
  | undefined
  | {
      taxonomies: TTaxonomy[];
      segments: any[];
    };

export interface IPwTaxonomiesHelperListFixtureTaxonomies
  extends IPwFixtureBase {
  taxonomies: TTaxonomy[];
}

export interface IPwTaxonomiesHelperListFixtureSegments extends IPwFixtureBase {
  segments: any[];
}
