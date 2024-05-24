export interface IMockError {
  id: number;
  order_id: number;
  taxonomy_id: number;
  url: string;
  step: string;
  dmp_id: number;
  dmp: string;
  error_message: string;
  request_object: string;
  response_object: string;
  response_code: number;
  resolved_by_user_id: null;
  ts_resolved: null;
  ts_created: string;
  data_partner_segment_name: string;
}

export const mockErrors: IMockError[] = [
  {
    id: 1613,
    order_id: 2714,
    taxonomy_id: 107046,
    url: "https://api.thetradedesk.com/v3/thirdpartydata",
    step: "",
    dmp_id: 2,
    dmp: "the_trade_desk",
    error_message:
      "The request failed validation. Please check your request and try again.",
    request_object:
      '{"Buyable": true, "ProviderId": "conint", "Description": "", "DisplayName": "datadesk.io-CIG-Mobile-Labour Force (15 to 24 years)-Labour Force (15 to 24 years) - Not in the labour force: Refers to persons who were neither employed nor unemployed. It includes students, homemakers, retired workers, seasonal workers in an \'off\' season who were not looking for work, and persons ", "ParentElementId": "private_segments_audience-2714", "ProviderElementId": "private_audiences_segment-2714_107046"}',
    response_object:
      '{"Message": "The request failed validation. Please check your request and try again.", "ErrorDetails": [{"Reasons": ["The property \'DisplayName\' must not be null and must have a length no less than 1 and no greater than 256."], "Property": "$.DisplayName"}]}',
    response_code: 400,
    resolved_by_user_id: null,
    ts_resolved: null,
    ts_created: "2023-09-15 10:45:34",
    data_partner_segment_name:
      "Labour Force (15 to 24 years) - Not in the labour force: Refers to persons who were neither employed nor unemployed. It includes students, homemakers, retired workers, seasonal workers in an 'off' season who were not looking for work, and persons who coul",
  },
  {
    id: 1614,
    order_id: 2714,
    taxonomy_id: 107046,
    url: "https://api.thetradedesk.com/v3/thirdpartydata",
    step: "",
    dmp_id: 2,
    dmp: "the_trade_desk",
    error_message:
      "The request failed validation. Please check your request and try again.",
    request_object:
      '{"Buyable": true, "ProviderId": "conint", "Description": "", "DisplayName": "datadesk.io-CIG-Mobile-Labour Force (15 to 24 years)-Labour Force (15 to 24 years) - Not in the labour force: Refers to persons who were neither employed nor unemployed. It includes students, homemakers, retired workers, seasonal workers in an \'off\' season who were not looking for work, and persons ", "ParentElementId": "private_segments_audience-2714", "ProviderElementId": "private_audiences_segment-2714_107046"}',
    response_object:
      '{"Message": "The request failed validation. Please check your request and try again.", "ErrorDetails": [{"Reasons": ["The property \'DisplayName\' must not be null and must have a length no less than 1 and no greater than 256."], "Property": "$.DisplayName"}]}',
    response_code: 400,
    resolved_by_user_id: null,
    ts_resolved: null,
    ts_created: "2023-09-15 11:00:31",
    data_partner_segment_name:
      "Labour Force (15 to 24 years) - Not in the labour force: Refers to persons who were neither employed nor unemployed. It includes students, homemakers, retired workers, seasonal workers in an 'off' season who were not looking for work, and persons who coul",
  },
  {
    id: 1615,
    order_id: 2714,
    taxonomy_id: 107046,
    url: "https://api.thetradedesk.com/v3/thirdpartydata",
    step: "",
    dmp_id: 2,
    dmp: "the_trade_desk",
    error_message:
      "The request failed validation. Please check your request and try again.",
    request_object:
      '{"Buyable": true, "ProviderId": "conint", "Description": "", "DisplayName": "datadesk.io-CIG-Mobile-Labour Force (15 to 24 years)-Labour Force (15 to 24 years) - Not in the labour force: Refers to persons who were neither employed nor unemployed. It includes students, homemakers, retired workers, seasonal workers in an \'off\' season who were not looking for work, and persons ", "ParentElementId": "private_segments_audience-2714", "ProviderElementId": "private_audiences_segment-2714_107046"}',
    response_object:
      '{"Message": "The request failed validation. Please check your request and try again.", "ErrorDetails": [{"Reasons": ["The property \'DisplayName\' must not be null and must have a length no less than 1 and no greater than 256."], "Property": "$.DisplayName"}]}',
    response_code: 400,
    resolved_by_user_id: null,
    ts_resolved: null,
    ts_created: "2023-09-15 11:15:26",
    data_partner_segment_name:
      "Labour Force (15 to 24 years) - Not in the labour force: Refers to persons who were neither employed nor unemployed. It includes students, homemakers, retired workers, seasonal workers in an 'off' season who were not looking for work, and persons who coul",
  },
];

export const getMockErrors = (
  order_id: number,
  taxonomy_id?: number | undefined,
): IMockError[] =>
  mockErrors.map((error) => ({
    ...error,
    order_id,
    taxonomy_id: taxonomy_id === undefined ? error.taxonomy_id : taxonomy_id,
  }));
