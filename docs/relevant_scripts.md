# datadesk.io Test Framework

## Relevant Packages & Scripts:

### Playwright

This project uses [Playwright](https://playwright.dev/) to create E2E tests. Playwright is a Microsoft-backed tool which was created specifically to accommodate the needs of end-to-end testing. Playwright supports all modern rendering engines including Chromium, WebKit, and Firefox. Test on Windows, Linux, and macOS, locally or on CI, headless or headed with native mobile emulation of Google Chrome for Android and Mobile Safari.

You can refer to [Playwright's Documentation](https://playwright.dev/docs/intro) for more details about how to use it.

#### Recorder Extension for VSCode IDE

Playwright offers an [Extension for VSCode](https://playwright.dev/docs/getting-started-vscode) that allow you to easily create and run specific tests.

First, you'll need to install VSCode in case you don't have it already installed in your computer. You can install [VSCode](https://code.visualstudio.com/) by accesising [this link](https://code.visualstudio.com/download)

Then, install the [VS Code extension from the marketplace](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) or from the extensions tab in VS Code by simply searching for Playwright in the top search bar. You shouldn't need to install Playwright again because this project already has Playwright as a dependency and you should have been installed it previously while following the [Getting Started](./getting_started.md) section.

### Prettier

This project uses [Prettier](https://prettier.io/) to format and define a style of the code. To format your code, you simply need to run

```sh
# If you're using NPM
npm run format:fix

# Or if you're using Yarn
yarn format:fix
```

Prettier will always run before a commit, you shouldn't need to run it - so don't worry.
