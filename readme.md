# Webpack Angularity Solution

Requisite configuration and modules to build Angularity projects with Webpack

## Angularity

[Angularity](http://angularity.github.io/) is an oppionated project structure for building applications in **AngularJS**.

This project is a [Webpack](https://webpack.github.io/) implementation, as an alternative to the original [browserify-Sass Angularity](https://github.com/angularity/node-angularity/) implementation.

## Rationale

The original [browserify-Sass Angularity](https://github.com/angularity/node-angularity/) implementation is stuck in [NodeJS](https://nodejs.org) engine `0.10.x`.

The solution contained in this project with work with **NodeJS 4.0.0**. It is more maintainable leverging an existing engine than maintaining the custom Angularity code.

## Limitations

* This package is **not** a global installation.

* This package does **not** contain [Karma](http://karma-runner.github.io/), you will need to install seperately, along with all its dependencies.

## Installation

Do **not** follow the Angularity [installation instructions](http://angularity.github.io/start/installation/).

Continue to use a Node **version manager** such as [nvm](https://github.com/creationix/nvm) for Mac, or [nvm-windows](https://github.com/coreybutler/nvm-windows) for Windows. However you can run on **NodeJS 4.0.0**, meaning:

```
nvm install 4.0.0
nvm use 4.0.0
```

And additionally on Mac you may wish to set your default Node version:

```
nvm alias default 4.0.0
```

### Prerequisites

* Install [cross-env](https://www.npmjs.com/package/cross-env) as a **global** package usin NPM, to allow you to write environment variables.

* Install [Karma](https://www.npmjs.com/package/karma) as a **global** package usin NPM, if you expect to be running Unit Tests.

### Each project

**`package.json`**

Use the following dev-dependencies and scripts in your project.

```json
"scripts": {
  "build": "webpack -d --progress",
  "build-unminified": "cross-env MYPROJECT_NO_MINIFY=true webpack -d --progress",
  "watch": "webpack -d --watch",
  "watch-unminified": "cross-env MYPROJECT_NO_MINIFY=true webpack -d --watch",
  "test": "cross-env MYPROJECT_NO_APP=true npm run build && karma start",
  "release": "cross-env MYPROJECT_RELEASE=true npm run build"
},
"devDependencies": {
  "babel-plugin-add-module-exports": "^0.1.1",
  "babel-preset-es2015": "^6.3.13",
  "webpack-angularity-solution": "latest"
}
```

You may be able to omit the babel dependencies if you have not been writing ES6 javascript.

Also don't forget to change **`MYPROJECT`** prefix to the name of your project to avoid environment variable crosstalk.

**`webpack.conf.js`**

Create a Webpack configuration file that delegates to the `webpack-angularity-solution` package. Use options taken from the same enviroment variables used in your `package.json` scripts.

```javascipt
/* global process:true */

module.exports = require('webpack-angularity-solution')({
    noApp   : process.env.MYPROJECT_NO_APP,
    noTest  : process.env.MYPROJECT_NO_TEST,
    noMinify: process.env.MYPROJECT_NO_MINIFY,
    release : process.env.MYPROJECT_RELEASE
});
```

**`karma.config.js`**

Use the `karma.config.js` that comes with `webpack-angularity-solution`, also found [here](https://github.com/angularity/webpack-angularity-solution/blob/master/karma.conf.js).

You may wish to change the `port` to a value unique to your project.

## Usage

Run the `scripts` that are defined in your `package.json` by using `npm run ...`.

For example:

* run a single build using `npm run build`

* run a watch using `npm run watch`