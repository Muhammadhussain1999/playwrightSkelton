export const DSPs = [
  {
    label: "The Trade Desk",
    id: 174,
    dmpId: 2,
    expectedFields: ["publisher", "field-product", "field-seat_id", ""],
  },
];

export const Tabs = [
  {
    id: "taxonomies",
    label: "Taxonomies",
  },
  {
    id: "files",
    label: "Files",
  },
  {
    id: "cron-logs",
    label: "Logs",
  },
] as const;

export type Tab = (typeof Tabs)[number];
export type PathParams = { orderId?: string };
export type PageParams = { dspId?: (typeof DSPs)[number]["id"] };
