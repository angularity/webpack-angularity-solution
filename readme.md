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

Please refere to detailed [installation](https://github.com//angularity/webpack-angularity-solution/wiki/installation) instructions.

## Project setup

Please refere to detailed [project setup](https://github.com//angularity/webpack-angularity-solution/wiki/project-setup) instructions.

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

### Existing structure

You should take a look at the [index.js](https://github.com/angularity/webpack-angularity-solution/blob/master/index.js) to see how the multi configurator is prepared. At the time of writing it is structured as follows.

![](./doc/extensibility.png)

For `test` and `release` there is no generator, a factory simply creates the configurator. In the case of `app` there is a generator that creates a configurator instance for each composition in the `/app` directory. Generators are passed the factory function so do not need to depend on `webpack-configurator` themselves.

When there are multiple compositions generated in `app`, each one of them is applied to the operations seperately. For `app` there are no additional operations, except those defined in `common`. While `test` and `release` define a single operation and then add the additional operations from `common`.

Finally all configurators are resolved to yield an Array of plain objects, suitable for Webpack. If you include several definitions then they will all contribute configurations to this Array.

### Making amendments

So if you want edit all modes, you would `append()` an operation to `common`. This may be done at any time before `resolve()` is called.

```javascript
module.exports = angularity(...)
  .define('common')
    .append(additional)
  ...
  .resolve();

function additional(configurator, options) {
  return configurator
    .merge(...);
}
```

If you wanted to edit `test`, you would `append()` an operation to `test`. This may be done at any time before `resolve()` is called.

```javascript
module.exports = angularity(...)
  .define('test')
    .append(additional)
  ...
  .resolve();

function additional(configurator, options) {
  return configurator
    .merge(...);
}
```

Each operation is passed the existing `configurator`, and the final (merged) `options` . It should return a configurator, usually the same instance as that provided.

### Custom configurator

If you want to add options, or change the generator, you may do so by calling the `create()` method.

Interestingly the export from `webpack-angularity-solution` is actually the `create()` function from an existing webpack-multi-configurator composition.

```javascript
module.exports = angularity({...}, newFactory)
  ...
  .create({...}, newerFactory)
  ...
  .resolve();

function newFactory(internalFactory, options) {
  var instance = internalFactory();
  instance.foo = function foo(){};
  return instance;
}

function newerFactory(newFactory, options) {
  var instance = newFactory();
  instance.bar = function bar(){};
  return instance;
}

```

You may call the `create()` method at any time. The new instance will inherit all the definitions from the previous one, but none of the inclusions.

If you specify a new factory function it will be passed the previous `factory`, and the final (merged) `options`. In this way you can redefine the `webpack-configurator` instance to your liking.