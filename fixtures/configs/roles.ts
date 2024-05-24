import path from "path";
export interface IRole {
  alias: string;
  name: string;
  is_employee: boolean;
  is_customer: boolean;
  is_data_partner: boolean;
  redirectOnLoad: string;
}
const availableSamples = ["admin", "datadesk_admin", "datadesk_user"];

export const roles = [
  {
    alias: "admin",
    name: "Admin",
    is_employee: true,
    is_customer: false,
    is_data_partner: false,
    redirectOnLoad: "search",
  },
  {
    alias: "sales",
    name: "Sales",
    is_employee: true,
    is_customer: false,
    is_data_partner: false,
    redirectOnLoad: "search",
  },
  {
    alias: "adops",
    name: "Ad Operations",
    is_employee: true,
    is_customer: false,
    is_data_partner: false,
    redirectOnLoad: "search",
  },
  {
    alias: "management",
    name: "Management",
    is_employee: true,
    is_customer: false,
    is_data_partner: false,
    redirectOnLoad: "search",
  },
  {
    alias: "datadesk_admin",
    name: "Datadesk Admin",
    is_employee: false,
    is_customer: true,
    is_data_partner: false,
    redirectOnLoad: "search",
  },
  {
    alias: "datadesk_user",
    name: "Datadesk User",
    is_employee: false,
    is_customer: true,
    is_data_partner: false,
    redirectOnLoad: "search",
  },
  {
    alias: "datadesk_data_partner",
    name: "Datadesk Data Partner",
    is_employee: false,
    is_customer: false,
    is_data_partner: true,
    redirectOnLoad: "financials",
  },
];

export interface IRoleSample extends IRole {
  sign_in_username_email: string;
  sign_in_password: string;
  path: string;
}
export const samples = roles.reduce<{
  [roleId in IRole["alias"]]: IRoleSample;
}>((acc, role) => {
  const { alias } = role;
  if (alias && availableSamples.includes(alias)) {
    acc[alias] = {
      sign_in_username_email: `role_${alias}@connectedinteractive.com`,
      sign_in_password: `${alias}@123`,
      path: path.join(__dirname, `playwright/.auth/${alias}.json`),
      ...role,
    };
  }
  return acc;
}, {});
