import config from "./_config";
import fs from "fs";
import {
  IPwUsersHelperListFixtureUsers,
  IPwUsersHelperGetOptions,
} from "./types";
import { IUserListGET } from "../types/user";

/**
 * Get the users from the fixture file
 * @param options request options
 * @returns a list of users
 */
const get_users = async ({
  ids,
  advertiser_id: advertiserId,
}: IPwUsersHelperGetOptions = {}): Promise<IUserListGET[]> => {
  if (!fs.existsSync(config.users.filePath)) {
    return [];
  }

  const data = (await import(
    config.users.filePath
  )) as IPwUsersHelperListFixtureUsers;

  if (!data?.users?.length) {
    return [];
  }

  if (!ids?.length) {
    return data.users;
  }

  return ((data.users ?? []) as IUserListGET[]).filter(
    ({ id, advertiser_id }) => {
      let isValid = true;
      if (ids?.length) {
        isValid = ids.includes(id);
      }

      if (!isValid) {
        return isValid;
      }

      if (isValid && advertiserId) {
        isValid = advertiserId === advertiser_id;
      }

      return isValid;
    },
  );
};

export const get_mock_user = async ({
  id,
  advertiser_id,
}: {
  id?: number;
  advertiser_id?: number;
} = {}): Promise<IUserListGET> => {
  const users = await get_users({ ids: id ? [id] : undefined, advertiser_id });
  if (!users?.length) {
    throw new Error("No list of users found");
  }

  if (!id && !advertiser_id) {
    const user_by_adv_id = users.find(
      ({ email }) => email === "demo@datadesk.io",
    );
    if (!user_by_adv_id) {
      throw new Error(
        `No list of user found by advertiser id: ${advertiser_id}`,
      );
    }
    return user_by_adv_id;
  }

  return users[0];
};

export default get_users;
