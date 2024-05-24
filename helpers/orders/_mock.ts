export const saveOrderMock = {
  validate_dsp_on_lotame: true,
  name: "Order[October 23,2023]",
  /**
   * Requires Change - this is the rank filter id
   * @example [76, 77, 78, 79, 137, 136, 135, 134]
   */
  rank_filters: [],
  /**
   * Requires Change - this is the rank filter group id
   * @default 1
   */
  rank_filter_group_id: 1,
  is_proposal: true,
  /**
   * Requires Change - this is the data partner data version used
   * @example [14, 24]
   */
  data_partner_segment_data_versions: [14, 24],
  data_partners: [],
  /**
   * Requires Change - this is the customer id
   * @default 638 (stands for "DD Demo")
   */
  customer_id: 638,
  segments: [],
  suggested_segments: [],
  /**
   * Requires Change - this is the customer buyer/user name
   * @default "DD Demo User"
   */
  buyer_name: "DD Demo User",
  /**
   * Requires Change - this is the customer buyer/user email
   * @default "demo@datadesk.io"
   */
  buyer_email: "demo@datadesk.io",
  datadesk: 1,
  sandbox: 0,
  additional_fields: {
    dsp_id: 179,
    product: 5,
    seat_id: "123456",
    currency: "USD",
  },
};
