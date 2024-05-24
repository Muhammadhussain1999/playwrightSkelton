import { PlaywrightTestConfig, defineConfig, devices } from "@playwright/test";
import { DotenvConfigOptions } from "dotenv";
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 *
 * When running the test, pass the "ENV" environment variable with one of the following:
 * a) staging - stands for circleCI environment
 * b) local_docker - stands for datadesk running local through docker
 * c) localhost [DEFAULT] - stands for datadesk running on localhost instead of docker
 *
 * Important, if we pass the environment variable DD_URL, it will overwrite the BASE_URL from the env file
 */
const defaultTimeout = 2 * 60 * 1000; // min * sec * ms
const dotEnvConfigOptions: DotenvConfigOptions = {
  path: `.env/${process.env.ENV ?? "docker"}`,
};
require("dotenv").config(dotEnvConfigOptions);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const playwriteConfig: PlaywrightTestConfig<
  { [key: string]: any },
  { [key: string]: any }
> = {
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: 2,
  /* Fails once failures reaches the value */
  // maxFailures: 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["junit", { outputFile: "junit.xml" }],
    ["html", { open: "never" }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL:
      process.env.DD_URL ||
      process.env.BASE_URL ||
      "https://staging.datadesk.io",

    /* When to take screenshots */
    screenshot: "only-on-failure",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Defines test-id attribute used in the code */
    testIdAttribute: "data-cy",

    /* Enabling random geolocation permission to allow support on Audience Builder feature */
    permissions: ["geolocation"],
    /* Defines base geolocation coordinates */
    geolocation: { latitude: 50.8551729, longitude: 4.340312 },
    viewport: { width: 1920, height: 1080 },
  },
  timeout: defaultTimeout, // min * sec * ms
  expect: {
    timeout: defaultTimeout, // min * sec * ms
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup-auth",
      testMatch: "**/*.setup-auth.ts",
    },
    {
      name: "setup-deps",
      dependencies: ["setup-auth"],
      testMatch: "**/*.setup-deps.ts",
    },
    {
      name: "chromium",
      dependencies: ["setup-auth", "setup-deps"],
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: {
          ignoreHTTPSErrors: true,
        },
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
};
export default defineConfig(playwriteConfig);
