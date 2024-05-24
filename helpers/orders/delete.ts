import { APIResponse, Browser } from "@playwright/test";
import { networkURLs } from "helpers/network";

interface IPwOrderHelperDeleteOptions {
  storageState: string;
}
/**
 * Deletes an order through an API request - does not require visual
 * @param playwright the playwright instance being used - can be used during before/after hooks
 * @param orderId the order ID that you expect to delete
 * @param options request options
 * @returns An instance of Playwright's APIResponse class
 */
export const deleteOrder = async (
  browser: Browser,
  orderId: number,
  options?: Partial<IPwOrderHelperDeleteOptions>,
): Promise<APIResponse> => {
  // Create a new APIRequestContext
  const context = await browser.newContext({
    storageState: options?.storageState,
  });

  // Define variables that will be used to request
  const data = { audience_id: orderId };
  // const headers = { cookie: headerCookies };
  const url = `${networkURLs.apiUrl}/audiences/delete`;

  // Run request
  const response = await context.request.post(url, { data });
  console.log(
    `Delete Order ID #${orderId} - [${response.status()}] - ${response.url()}`,
  );

  return response;
};
