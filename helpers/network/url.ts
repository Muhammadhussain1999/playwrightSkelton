interface INetworkURLs {
  /** URL domain to API requests */
  apiDomain: string;
  /** Base URL used to API requests - including `/api/datadesk_io` */
  apiUrl: string;
  /** Extra domain to set session cookies `ci_session` */
  cookiesDomain: string;
  /** Boolean if running against staging api backend */
  staging: boolean;
}

export const networkURLs: INetworkURLs = (() => {
  const apiDomain = (
    process.env.APPV2_URL ?? "https://staging.staging.connectedinteractive.com"
  ).replace(/http[s]?:\/\//, "");

  const cookiesDomain = apiDomain.replace(
    /(.*).staging.connectedinteractive.com/,
    "staging.staging.connectedinteractive.com",
  );

  const apiUrl = `${process.env.APPV2_URL}/api/datadesk_io`.replace(
    "//api",
    "/api",
  );
  const response: INetworkURLs = {
    apiUrl,
    cookiesDomain,
    apiDomain,
    staging: apiDomain.includes(".staging.connectedinteractive.com"),
  };

  return response;
})();
