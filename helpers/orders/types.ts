import { IRoleSample } from "fixtures/configs/roles";
import { IPwFixtureBase } from "helpers/types/_config";

export type TDataPartner = {
  id: number;
  name: string;
  website: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  secondary_contact_name: string;
  secondary_contact_email: string;
  secondary_contact_phone: string;
  accounting_contact_name: string;
  accounting_contact_email: string;
  accounting_contact_phone: string;
  address: string;
  city: string;
  province: string;
  country_id: number;
  timezone: number;
  payment_terms_id: number;
  currency_id: number;
  promoted_flag: number;
  logo_file_name: string;
  notes: string;
  ts_created: string;
  ts_updated: string;
  ts_deleted: null;
  available_in_datadesk: number;
  available_in_proposal_builder: number;
  latest_data_version_id: number;
};

export type TPublisher = {
  id: number;
  name: string;
  schema: {
    version: number;
    fields: {
      label: string;
      required: boolean;
      type: string;
      multiple?: boolean;
      configuration_only?: boolean;
      options?: {
        id: number | string;
        description: string;
        name: string;
      }[];
      id: string;
      customization?: {
        label: {
          product: {
            case: number;
            value: string;
          }[];
        };
      };
    }[];
    metadata?: {
      dsp_code: string;
    };
  };
};

export type TDataPartnerSource = {
  id: number;
  display_name: string;
  data_partner_id: number;
  data_partner_name: string;
  data_partner_segment_data_version_id: number;
};

export type TRankGroup = {
  id: number;
  name: string;
  rank_filters: {
    rank_filter_id: number;
    data_version_id: number;
  }[];
};

export interface IPwOrderGetHelperListOptions {
  storeAsAFixture: boolean;
  role: IRoleSample;
}

export interface IPwOrderGetHelperApiResponse {
  data_partners: TDataPartner[];
  publishers: TPublisher[];
  data_partners_sources: TDataPartnerSource[];
  rank_groups: TRankGroup[];
  proposal?: null | { [key: string]: any };
}

export interface IPwFixtureRankGroups extends IPwFixtureBase {
  rank_groups: TRankGroup[];
}

export type Action =
  | "data_partners"
  | "data_partners_sources"
  | "publishers"
  | "rank_groups";
