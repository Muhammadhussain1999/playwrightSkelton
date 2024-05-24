import { test, expect } from "@playwright/test";
import { IRoleSample, samples as roles } from "fixtures/configs/roles";
import { appRoutes } from "fixtures/configs/routes";
import { isWhitelabel } from "fixtures/configs/whitelabel";

const routes = appRoutes as { [key: string]: any };
const rolesListToTest: (IRoleSample | undefined)[] = Object.values(roles);
rolesListToTest.push(undefined);

rolesListToTest.map((role: IRoleSample | undefined) => {
  const routesStatus: any = {};
  // @todo Optimize test by reusing login information: https://playwright.dev/docs/auth#authenticate-with-api-request
  test.describe(`Route authorization for ${role?.alias}`, () => {
    for (const feature in routes) {
      const route = routes[feature];
      const { path } = route;

      if (routesStatus[path]) continue;
      const { possible_paths, regex } = getPossiblePaths(route, role);
      const isAllowed = isRouteAllowed(routes[feature], role);
      let testId = `Permission: ${
        !isAllowed ? "Not" : ""
      } Allowed to visit: ${path} when NOT logged`; //eslint-disable-line
      if (role) {
        testId = `Permission: ${!isAllowed ? "Not" : ""} Allowed to visit: ${path} when logged`;
      }

      routesStatus[path] = {
        isAllowed,
        possible_paths,
        regex,
      };
      test.use({ storageState: role?.path });
      test(testId, async ({ page }) => {
        await page.goto(path);
        await page
          .getByRole("banner")
          .locator("div")
          .first()
          .waitFor({ state: "visible" });

        await page.waitForURL(
          (url: URL) =>
            !!possible_paths.find((path: string) =>
              url.toString().includes(path),
            ),
        );

        await expect(
          !!possible_paths.find((path: string) => page.url().includes(path)),
        ).toBeTruthy();
      });
    }
  });
});

function getPossiblePaths(
  route: IGetPathsRoute,
  role?: IRoleSample,
): { regex: RegExp; possible_paths: string[] } {
  const { path, params } = route;
  let pathname = (params || []).reduce(
    (acc, param) => path.replace(`/:${param}`, ""),
    path,
  );
  if (path[path.length - 1] === "/") {
    // eslint-disable-line
    pathname = path.slice(0, -1);
  }

  const isAllowed = isRouteAllowed(route, role);
  let possible_paths = [routes["login"].path];
  if (!isWhitelabel()) {
    possible_paths.push(routes["landing"].path);
  }

  if (role?.redirectOnLoad && routes[role.redirectOnLoad]?.path) {
    possible_paths.push(routes[role.redirectOnLoad]?.path);
  }
  if (isAllowed) {
    possible_paths.push(pathname);
  }
  possible_paths = possible_paths.filter(
    (value, index, arr) => arr.indexOf(value) === index,
  );
  const regex = RegExp(possible_paths.join("|").split("/").join("/"), "g"); //eslint-disable-line

  return {
    regex,
    possible_paths,
  };
}

function isRouteAllowed(
  route: { [key: string]: any },
  role?: IRoleSample,
): boolean {
  const { roles, whitelabel, available_without_children, session_required } =
    route;

  if (!role) {
    return !session_required;
  }

  let isAllowed = Boolean(roles.includes(role?.name));
  if (isAllowed && isWhitelabel() && !whitelabel) {
    isAllowed = false;
  }
  if (!available_without_children) {
    isAllowed = false;
  }

  return isAllowed;
}

interface IGetPathsRoute {
  path: string;
  params?: string[];
  [key: string]: any;
}
