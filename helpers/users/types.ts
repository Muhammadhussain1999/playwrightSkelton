import { IUserListGET } from "helpers/types/user";
import { IPwFixtureBase } from "../types/_config";

export interface IPwUsersHelperListFixtureUsers extends IPwFixtureBase {
  users: IUserListGET[];
}

export interface IPwUsersHelperGetOptions {
  ids?: number[];
  advertiser_id?: number;
}

export interface IPwUsersHelperListOptions {
  advertiser_id?: number;
}

export interface IMockUser {}
