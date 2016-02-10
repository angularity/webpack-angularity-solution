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

* This package does **not** contain [Karma](http://karma-runner.github.io/) and does not support Unit Testing without other co-requisites (see below).

* This package presumes [npm scripts](https://docs.npmjs.com/misc/scripts). If you want to run outside of scripts you will need some additional global installs (see below).

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

Install [karma-angularity-solution](https://github.com/angularity/karma-angularity-solution) as a **local dev-dependency** if you expect to be running Unit Tests.

```
npm install --save-dev karma-angularity-solution
```

Note that you do **not** need any global installs if you only use [npm scripts](https://docs.npmjs.com/misc/scripts). But if you operate outside of npm scripts you will find that you are missing [Webpack CLI](https://github.com/webpack/docs/wiki/cli), and [cross-env](https://www.npmjs.com/package/cross-env) as global installs.


### Each project

Please read in full. Failure to configure any one of the following may leave you with a broken project.

#### `package.json`

Use the following dev-dependencies and scripts in your project.

```json
{
  "scripts": {
    "build": "webpack -d --progress",
    "build-unminified": "cross-env UNMINIFIED=true webpack -d --progress",
    "watch": "webpack -d --watch",
    "watch-unminified": "cross-env UNMINIFIED=true webpack -d --watch",
    "release": "cross-env MODE=release webpack -d --progress"
  },
  "devDependencies": {
    "webpack-angularity-solution": "latest",
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

#### `webpack.config.js`

Create a Webpack configuration file that delegates to the `webpack-angularity-solution` package. Use options taken from the same environment variables used in your `package.json` scripts.

```javascript
/* global process:true */

var angularity = require('webpack-angularity-solution');

module.exports = angularity(process.env, {
    globals: {
        $              : 'jquery',
        jQuery         : 'jquery',
        'window.jQuery': 'jquery'
    }
}).resolve(function () {
    /* jshint validthis:true */
    return (process.env.MODE in this) ? this[process.env.MODE] : [].concat(this.app).concat(this.test);
});
```

Some explanation:

* **Options by `process.env`**

	In the example you can see that more than one configuration may be passed to `angularity()`. This means `process.env` may be passed in entirety.

	The solution will automatically convert any upper-case option `SOME_OPTION` to camel-case `someOption` and parse strings to the correct type.

* **Option `globals`**

	Note that there are **no globals** in applications bundled by Webpack. If your code relies on globals such as jQuery, you will have to configure the `globals` option as shown above.

	Add additional globals as required by your application.

* **The `resolve()` method**

	This is pro-forma. Refer to the section on **extensability** for more detail.
	
	Suffice to say that valid values of the `MODE` are `app`|`test`|`release`. Omission of `MODE` implies both `app` and `test` compilations.

#### `.babelrc`

If you are **compiling future Javascript** down to to current javascript you will need to configure [BabelJS](https://babeljs.io/) with the particulars.

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

Note that if you have an `angularity.json` file then its `port` property will be used as the default value, rather than `55555`.

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

#### Full customisation

These additional settings may be used to deviate from Angularity's optinionated project structure.

```javascript
appDir    : './app',           // your composition roots
buildDir  : './app-build',     // output of the app build
testDir   : './app-test',      // output of the test build
releaseDir: './app-release',   // output of the release build
testGlob  : '**/*.spec.js'     // identify your test files
```

### Bower

Bower packages may be imported like node modules but if there is a node module of the same name available then it will be used in preference.

Inline loader statements (see shimming) cannot be used when requiring bower packages. If the package requires globals (such as jQuery) then then need to be set in the Angularity options.

### Shimming

If a package does not export anything, or requires some global, then it may be [shimmed](https://github.com/webpack/docs/wiki/shimming-modules) on an as-used basis.

Since the **Angular** package does not export anything it would normally require the `export-loader?angular` statement to be used. However this is already taken care of in the common configuration and you do not need to take further action.


## Extensability

### Modes

The result of `angularity()` is an instance with a number of accessors - `app`, `test`, and `release` - corresponding to different compilation **modes**. Each accessor returns a [webpack-configurator](https://www.npmjs.com/package/webpack-configurator) or Array thereof.

* **`instance.app : Array.<WebpackConfigurator>`**

	Retrieve a list of `webpack-configurator` instances, one for each application in the `appDir`.

* **`instance.test : WebpackConfigurator`**

	Retrieve a single `webpack-configurator` instance for unit tests.

* **`instance.release : WebpackConfigurator`**

	Retrieve a single `webpack-configurator` instance to release the root application in the `appDir`.

### Resolving

While [webpack-configurator](https://www.npmjs.com/package/webpack-configurator) provides methods for extensibility of the configuration it is not a valid webpack configuration until `configurator.resolve()` is called.

This is done automatically by the `angularity.resolve()` method, removing the need to iterate over the (possibly numerous) configurator instances.

```javascript
module.exports = angularity(...)
  .resolve(function() {
    // this === angularity instance (i.e. this.app | this.test | this.release)
    // return a webpack-configurator or Array.<webpack-configurator>
    //   the .resolve() method will be called on each element returned
  });
```

### Operators

In order to create the configurators for each **mode**, a number of additional **operators** are added to `webpack-configurator`.

You may add your own operator using the `extend()` method. Each operator is called with the current instance of the Configurator as `this` and should return the same or a new Configurator.

For example, to add the `foo` operator:

```javascript
module.exports = angularity(...)
  .extend({
    foo: function foo() {
      return this
        .merge({...});  // use the fluent webpack-configurator API
    }
  })
  .resolve(function () {
    return this.test
      .foo();  // operators are available on any Configurator instances comming out of 'test'
  })
```

There are a number of operators used internally. These include:

* `addBrowserSync(directory:string, port:number):Configurator`

	Add browser-sync server for Webpack `--watch`
	
* `addClean(directory:string):Configurator`

	Remove the given directory at compilation start.

* `addCommon(loaderRoot:string, options:{appDir:string, globals:object, stats:string}):Configurator`

	Add configuration common to all modes.
	
* `addComposition(item:{namespace:Array.<string>, directory:string, htmlFiles:Array, indexFiles:Array}):Configurator`

	Add an application for compilation.
	
* `addConditionals(flags:object):Configurator`

	Add compiler conditionals.
	
* `addExternalChunkManifest():Configurator`

	Minimise changes in asset hashing by externalising the chunk manifest. Required for long term caching of assets.
	
* `addMinification(enabled:boolean):Configurator`

	Minify javascript where enabled.
	
* `addTestSuiteGeneration(outputFile:string, testGlob:string):Configurator`

	Locate all specification files and generate a file that require()s them all.