# datadesk.io Test Framework

## Getting Started:

The project requires:

## [node.js](https://nodejs.org/en/download/)

a javascript runtime built using Chrome's V8 Javascript Engine. The project requires at least version 6+. You can check if you have Node.js using the following command on your terminal:

```sh
node -v
```

You can either download nodeJS from its website or you can use [NVM - Node Version Manager](https://github.com/nvm-sh/nvm) to install, manage, and use multiple versions of nodeJS in your environment. Refer its website to download if you prefer. We highly recomend using NVM instead of download nodeJS directly from its website.

### NPM or Yarn

- NPM is a package manager installed with Node.js, so if you have Node.js installed, then you should also got NPM. You can check you NPM version using the following command:

```sh
npm -v
```

- You can use Yarn as a substitute to NPM. Yarn is a package manager built by Facebook, Google, Exponential, and Tilde. It is said to be safer and faster then NPM.
  You can download it on [yarnpkg.com](https://yarnpkg.com/en/docs/install). On the other hand, if you have it installed, you can check Yarn's version using the following command:

```sh
yarn version
```

## Installing - Let's run it

You should download, install and run locally this repo using the following commands:

```sh
git clone https://github.com/conectedinteractive/datadesk_playwright.git
cd datadesk_playwright
```

```sh
#If you're using NPM
npm ci

# If you're using YARN
yarn install --frozen-dependencies
```

Finally, in order to run the Test Console and run a pre-existing test, simply run

```sh
#If you're using NPM
npm run gui

# If you're using YARN
yarn gui
```
