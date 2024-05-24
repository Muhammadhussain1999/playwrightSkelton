import fs from "fs";
import { Browser } from "@playwright/test";

import { networkURLs } from "helpers/network";
import { IUserListGET } from "helpers/types/user";
import { samples as roles } from "fixtures/configs/roles";

import config from "./_config";
import {
  IPwUsersHelperListOptions,
  IPwUsersHelperListFixtureUsers,
} from "./types";

/**
 * Get the list of users available through an API request - does not require visual
 * @param browser the playwright browser instance being used - can be used during before/after hooks
 * @returns a list of users fetched
 */
export default async (
  browser: Browser,
  { advertiser_id }: IPwUsersHelperListOptions = {},
): Promise<any> => {
  const listResponse: { users: IUserListGET[] } = { users: [] };
  const context = await browser.newContext({
    storageState: roles?.admin?.path,
  });

  const usersBasePath = config.users.basePath;
  const usersPath = config.users.filePath;
  const usersFixtureExists = await fs.existsSync(usersPath);
  let shouldUpdateUsers = !usersFixtureExists;
  if (!shouldUpdateUsers) {
    const dataTax = (await import(usersPath)) as any;
    if (dataTax.server !== networkURLs.apiUrl) {
      shouldUpdateUsers = true;
    } else if (dataTax.timestamp < new Date().getTime() - 1000 * 60 * 60 * 24) {
      shouldUpdateUsers = true;
    }

    // If the file exists and it's outdated, delete it
    if (shouldUpdateUsers) {
      await fs.unlinkSync(usersPath);
    } else {
      listResponse.users = dataTax.taxonomies;
    }
  }

  if (!shouldUpdateUsers) {
    return listResponse;
  }

  const mapUrlParams = new Map<string, string>();

  if (advertiser_id) {
    mapUrlParams.set("advertiser_id", `${advertiser_id}`);
  }

  const urlParams = new URLSearchParams(
    Object.fromEntries(mapUrlParams),
  ).toString();

  const url = `${networkURLs.apiUrl}/users/list?${urlParams}`;
  const response = await context.request.get(url);
  const json = await response.json();

  if (!json?.users?.length) {
    throw new Error("No users found");
  }

  // Check if the file exists and if it's outdated
  const usersJson: IPwUsersHelperListFixtureUsers = {
    timestamp: new Date().getTime(),
    server: networkURLs.apiUrl,
    // sort taxonomies by `devices` property DESC
    users: json.users as IUserListGET[],
  };

  if (!fs.existsSync(usersBasePath)) {
    fs.mkdirSync(usersBasePath, { recursive: true });
  }

  await fs.writeFileSync(usersPath, JSON.stringify(usersJson, null, 2));

  listResponse.users = usersJson.users;
  return listResponse;
};
