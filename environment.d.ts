declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Stands for the application's hostname - it will be used by playwright to access the proper page.
       */
      BASE_URL: string;
      /**
       * A custom API endpoint for the application.
       */
      APPV2_URL?: string;
      /**
       * List of environment file names available on the .env folder
       */
      ENV?: "localhost" | "docker" | "staging" | "custom";
      /**
       * The current environment the application is running on. (should include legacy ones)
       */
      NODE_ENV: "development" | "production" | "test" | "local" | "testing";
      /**
       * The Customer ID of the whitelabel version.
       * Innitially, that is used to check if is enabled the whitelabel version.
       */
      WHITELABEL_CUSTOMER_ID?: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
