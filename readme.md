# Webpack Angularity Solution

Requisite configuration and modules to build Angularity projects with Webpack

## Angularity

[Angularity](http://angularity.github.io/) is an opinionated project structure for building applications in **AngularJS**.

This project is a [Webpack](https://webpack.github.io/) implementation, as an alternative to the original [Browserify-Sass Angularity](https://github.com/angularity/node-angularity/) implementation.

## Rationale

The original [Browserify-Sass Angularity](https://github.com/angularity/node-angularity/) implementation is stuck in [NodeJS](https://nodejs.org) engine `0.10.x`.

The solution contained in this project with work with **NodeJS 4.0.0**. It is more maintainable leverging an existing engine than maintaining the custom Angularity code.

## Limitations

* This package is **not** a global installation. You need to install as a [development dependency](https://docs.npmjs.com/files/package.json#devdependencies) in every single project you wish to build.

* This package does **not** contain [Karma](http://karma-runner.github.io/) and does not support Unit Testing without other pre-requisites (see below).

* This package does **not** contain the [Webpack CLI](https://github.com/webpack/docs/wiki/cli), you will need to install separately (see below).

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

Now install this package as a **local dev-dependency**.

```
npm install --save-dev webpack-angularity-solution
```

### Co-requisites

* Install [Webpack CLI](https://github.com/webpack/docs/wiki/cli) as a **global** package using NPM.

	```
	npm install -g webpack
	```

* Install [cross-env](https://www.npmjs.com/package/cross-env) as a **global** package using NPM, to allow you to write environment variables from your [NPM scripts](https://docs.npmjs.com/misc/scripts).

	```
	npm install -g cross-env
	```

* Install [karma-angularity-solution](https://github.com/angularity/karma-angularity-solution) as a **local dev-dependency** if you expect to be running Unit Tests.

	```
	npm install --save-dev karma-angularity-solution
	```

### Each project

Please read in full. Failure to configure any one of the following may leave you with a broken project.

#### `package.json`

Use the following dev-dependencies and scripts in your project.

```json
"scripts": {
  "build": "webpack -d --progress",
  "build-unminified": "cross-env MYPROJECT_NO_MINIFY=true webpack -d --progress",
  "watch": "webpack -d --watch",
  "watch-unminified": "cross-env MYPROJECT_NO_MINIFY=true webpack -d --watch",
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

#### `webpack.conf.js`

Create a Webpack configuration file that delegates to the `webpack-angularity-solution` package. Use options taken from the same environment variables used in your `package.json` scripts.

```javascript
/* global process:true */

module.exports = require('webpack-angularity-solution')({
    port    : process.env.MYPROJECT_PORT ? parseInt(process.env.MYPROJECT_PORT) : undefined,
    noApp   : process.env.MYPROJECT_NO_APP,
    noTest  : process.env.MYPROJECT_NO_TEST,
    noMinify: process.env.MYPROJECT_NO_MINIFY,
    release : process.env.MYPROJECT_RELEASE,
	provide : {
        $              : 'jquery',
        jQuery         : 'jquery',
        'window.jQuery': 'jquery'
    }
});
```

Note that there are **no globals** in applications bundled by Webpack. If your code relies on globals such as jQuery, you will have to configure the `provide` option as shown above. Add additional globals as required by your application.

#### `.babelrc`

If you are **compiling future Javascript** down to to current javascript you will need to configure **BabelJS** with the particulars.

Angularity has traditionally supported ES6 (now es2015) so we will use that as an example. Also note that the Babel `default export` behaviour has changed so we will be use [babel-plugin-add-module-exports](https://www.npmjs.com/package/babel-plugin-add-module-exports) to retain the previous syntax.

Both of these aspects were installed above as `devDependencies` so we can now create a babel-js [configuration file](https://babeljs.io/docs/usage/babelrc/) that uses them.

```
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

### Options

* `port:int` Optional port (that overrides `angularity.json`)

* `noApp:boolean` Inhibit building the Application (speeds up the test build)

* `noTest:boolean` Inhibit building Unit Tests (speeds up the application build)

* `noMinify:boolean` Inhibit minification of the application (test build is not minified)

* `release:boolean` Externalise the Webpack chunk manifest to allow long-term caching (incompatible with test build)

* `provide:object` A hash of packages keyed by the global variable that they represent