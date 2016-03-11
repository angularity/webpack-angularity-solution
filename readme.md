# Webpack Angularity Solution

Requisite configuration and modules to build Angularity projects with Webpack

## Angularity

[Angularity](http://angularity.github.io/) is an opinionated project structure for building applications in **AngularJS**.

This project is a [Webpack](https://webpack.github.io/) implementation, as an alternative to the original [Browserify-Sass Angularity](https://github.com/angularity/node-angularity/) implementation.

## Rationale

The original [Browserify-Sass Angularity](https://github.com/angularity/node-angularity/) implementation is stuck in [NodeJS](https://nodejs.org) engine `0.10.x`.

The solution contained in this project with work with **NodeJS 4.x.x**. It is more maintainable leverging an existing engine ([Webpack](https://webpack.github.io/)) than maintaining the custom Angularity code.

## Limitations

* This package is **not** a global installation. You need to install as a [development dependency](https://docs.npmjs.com/files/package.json#devdependencies) in every single project you wish to build.

* This package does **not** contain [Karma](http://karma-runner.github.io/) and does not support Unit Testing without other co-requisites (see below).

* This package presumes [npm scripts](https://docs.npmjs.com/misc/scripts). If you want to run outside of scripts you will need some additional global installs (see below).

## Installation

Do **not** follow the Angularity [installation instructions](http://angularity.github.io/start/installation/).

Where you see Node `4.4.0` mentioned below you may substitute the latest Node `4.x.x` version.

### Node

Continue to use a Node **version manager** such as [nvm](https://github.com/creationix/nvm) for Mac, or [nvm-windows](https://github.com/coreybutler/nvm-windows) for Windows.

Ensure **NodeJS 4.x.x**, meaning:

```
nvm install 4.4.0
nvm use 4.4.0
```

Additionally **on MacOS** you may wish to set your default Node version. Otherwise the next terminal window you will open will have reverted.

```
nvm alias default 4.4.0
```

Double check you have the correct version. The following should report `4.4.0`:
```
node -v
```

Also check you have **npm `3.x.x`**. This is less critical but we recommend npm 3 over npm 2 because that is what we have tested.
```
npm -v
```

### Dependencies

All packages should be installed as **local dev-dependencies**.

You do **not** need any global installs if you only use [npm scripts](https://docs.npmjs.com/misc/scripts).

```
npm install --save-dev webpack-angularity-solution
```

Install [karma-angularity-solution](https://github.com/angularity/karma-angularity-solution) **only if** you expect to be running Unit Tests.

```
npm install --save-dev karma-angularity-solution
```

Install [BabelJS](https://babeljs.io/) dependencies **only if** you will be using future javascript as described below. Due to the churn in Babel it is recommended you [save exact](http://blog.ricca509.me/save-exact-version-of-module-npm/) or at least pin to tilde `~` range.

```
npm install --save-dev --save-exact babel-preset-es2015 babel-plugin-add-module-exports
```


### Each project

Please read in full. Failure to configure any one of the following may leave you with a broken project.

You may delete the redundant files:
* `angularity.json`

Ensure you add or amend the following files:

* For each **app** in your `/app` directory
 * `index.html`

* In your project root
 * `package.json`
 * `webpack.config.js`
 * `.babelrc`

Details are given below.

#### index.html

The injection tags have changed slightly. Your file should look like this.

```html
<html>
  <head>
    <!-- inject:css -->
    <!-- endinject -->
  </head>

  <body>
    <!-- inject:json -->
    <!-- endinject -->

    <!-- inject:js -->
    <!-- endinject -->
  </body>
</head>
```

The changes may be sumarised as:

* Remove `bower:css`
* Remove `bower:js`
* Add `inject:json` for bundle manifest (must come before `inject:js`)

#### package.json

Use the following dev-dependencies and scripts in your project.

```json
{
  "scripts": {
    "build": "webpack -d --progress",
    "build-unminified": "cross-env UNMINIFIED=true webpack -d --progress",
    "watch": "webpack -d --watch",
    "watch-unminified": "cross-env UNMINIFIED=true webpack -d --watch",
    "release": "cross-env MODE=release webpack -d --progress"
  }
}
```

Based on installation instructions you should also have dependencies similar to the following:

```json
{
  "devDependencies": {
    "webpack-angularity-solution": "^1.0.0",
    "babel-plugin-add-module-exports": "^0.1.1",
    "babel-preset-es2015": "^6.3.13"
  }
}
```

Some explanation:

* **BabelJS**

	You may be able to omit the [BabelJS](https://babeljs.io/) dependencies if you have not been writing ES6 javascript.

* **cross-env**

	Any setting passed to `cross-env` corresponds to environment variables. By convention they are `UPPERCASE`. These environment variables are private to the executable that follows so you don't need to worry about name conflicts across different projects.

#### webpack.config.js

Create a Webpack configuration file that delegates to the `webpack-angularity-solution` package. Use options taken from the same environment variables used in your `package.json` scripts.

```javascript
/* global process:true */

var angularity = require('webpack-angularity-solution');

const PORT    = 55555,
      GLOBALS = {
        $              : 'jquery',
        jQuery         : 'jquery',
        'window.jQuery': 'jquery'
      };

module.exports = angularity({globals: GLOBALS, port: PORT}, process.env)
  .include(process.env.MODE) // app|test|release
  .otherwise('app_test')	 // run app+test if MODE is unspecified
  .resolve();
```

Some explanation:

* **Option `globals`**

	Note that there are **no globals** in applications bundled by Webpack. If your code relies on globals such as jQuery, you will have to configure the `globals` option as shown above.

	Add additional globals as required by your application.
	
	TODO shimming
	
* **Option `port`**

  By default `--watch` in the `app` mode will launch a BrowserSync server on port `55555`. You should override this port to some unique value so that your projects to no conflict with each other.

* **Options by `process.env`**

	More than one configuration may be passed to `angularity()`. This means `process.env` may be passed in entirity (See environment variables below).

* **The `include()` and `otherwise()` methods**

	The `include()` statement runs either of the defined `app`|`test`|`release` compilations where the `MODE` environment variable.
	
	Omission of `MODE` implies the `otherwise()` behavior, where both `app` and `test` compilations will run. You should customise this default behavior to your taste.
	
	The `test` mode is only meaningful if you have `*.spec.js` files in your project.

#### .babelrc

If you are **compiling future Javascript** down to to current javascript you will need to configure [BabelJS](https://babeljs.io/) with the features you desire.

Angularity has traditionally supported ES6 (now es2015) so we will use that as an example. Also note that the Babel `default export` behaviour has changed so we will be use [babel-plugin-add-module-exports](https://www.npmjs.com/package/babel-plugin-add-module-exports) so that `require()` statements yeild the default export.

Both of these aspects were installed above as `devDependencies` so we can now create a babel-js [configuration file](https://babeljs.io/docs/usage/babelrc/) that uses them.

```json
{
  "presets": [
    "es2015"
  ],
  "plugins": [
    "add-module-exports"
  ]
}
```

## Usage

Run the `scripts` that are defined in your `package.json` by using `npm run ...`.

For example:

* run a single build using `npm run build`

* run a watch using `npm run watch`

* run release build using `npm run release`

### Options

#### General settings

```javascript
port      : 55555,       // port to serve during watch
unminified: false,       // switch to unminified
publicPath: undefined,   // CDN path for release builds
globals   : {},          // A hash of packages keyed by their global variable
stats     : {            // console output
  hash        : true,
  version     : true,
  timings     : true,
  assets      : true,
  chunks      : true,
  modules     : true,
  reasons     : true,
  children    : true,
  source      : true,
  errors      : true,
  errorDetails: true,
  warnings    : true,
  publicPath  : true          
}
```

#### Full customisation

These additional settings may be used to deviate from Angularity's optinionated project structure.

```javascript
appDir    : './app',           // your composition roots
buildDir  : './app-build',     // output of the app build
testDir   : './app-test',      // output of the test build
releaseDir: './app-release',   // output of the release build
testGlob  : '**/*.spec.js'     // identify your test files
```

#### Environment variables

All options may be parsed from uppercase environment variables.

Use an underscrore to delimit camel-case, meaning `buildDir` is written as environment variable `BUILD_DIR`.

Use a double underscore to delimit a nested field, meaning `stats.warnings` is written as environment variable `STATS__WARNINGS`.

For example, to **suppress warnings** during the build:

```json
{
  "scripts": {
    "silent": "cross-env STATS__WARNINGS=false webpack -d --progress"
    ...
  }
}
```

### Bower

Bower packages may be imported like node modules. Requiring the full module will generate code that requires each bower `main` element.

If it does not exist a `vendor.js` file will be **generated** in your `/app` directory if you have any Bower dependencies. This file may be ammended to fix any bad bower modules.

If there is a node module of the same name available then it **should** be used in preference but some edge cases exist. Best practice should ensure you do **not** have a module installed with the same name as your intended npm module. If a given module is not working as expected, build unminified and establish exactly where the module is comming from.

Inline loader statements (see shimming) cannot be used when requiring the bower package wholesale. If the package requires globals (such as jQuery) then then need to be set in the `globals` option. Alternatively you can import the consituent files of the package one-by-one, in which case shimming will work.

### Shimming

If a package does not export anything, or requires some global, then it may be [shimmed](https://github.com/webpack/docs/wiki/shimming-modules) on an as-used basis.

Since the **Angular** package does not export anything it would normally require the `export-loader?angular` statement to be used. However this is already taken care of in the common configuration and you do not need to take further action.

### Tests

Running in `test` mode will cause `test.js` file to generated in the `/app` directory. It will be composed of any Bowever `devDependencies` along with all `*.spec.js` files found in your project.

If it is present it will not be overwritten so you will need to manually add any new `*.spec.js` files that you create thereafter.

## Extensability

There has been a lot of effort made to ensure you can extend the Webpack configurations with your own ammendments.

The defined modes of `app`, `test`, and `release` each generate one or more [webpack-configurator](https://www.npmjs.com/package/webpack-configurator) instances. You will need to understand the webpack-configurator API in order to make any changes.

Each of these modes is defined using [webpack-multi-configurator](https://www.npmjs.com/package/webpack-multi-configurator).