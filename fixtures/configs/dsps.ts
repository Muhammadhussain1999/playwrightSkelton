export interface IDSP {
  name: string;
  product: {
    name: string;
    label: string;
    secret_key?: string;
  };
  currency?: string;
}

export const TTD = {
  name: "The Trade Desk",
  product: [
    { name: "Third Party Data - Partner ID", label: "Seat ID" },
    { name: "Third Party Data - Advertiser ID", label: "Seat ID" },
    {
      name: "First Party Data - Advertiser ID",
      label: "Seat ID",
      secret_key_label: "Secret Key",
    },
  ],
};

export const AdForm = {
  name: "Ad Form",
  product: [{ name: "AdForm", label: "AdForm Seat ID" }],
  currency: ["USD", "EUR"],
};

export const Google = {
  name: "Google",
  product: [
    { name: "Display & Video 360 - Advertiser Level", label: "Link ID" },
    { name: "Display & Video 360 - Partner Level", label: "Google Client ID" },
    { name: "Google Ad Manager 360", label: "Google Client ID" },
  ],
  currency: ["USD", "CAD", "EUR"],
};

export const Equativ = {
  name: "Equativ",
  product: [
    {
      name: "Direct Integration",
      label: "Client ID",
      secret_key_label: "Client ID",
      other_id: "Segment Provider ID",
    },
  ],
};
