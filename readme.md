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

## Overview

This package is a singple `devDependency` that bundles together a comprehensive solution for building **AngularJS 1.x** projects.

It eliminates the need to specify multiple dependencies in your root project. Unfortunately following **npm 3.x** you will still get noise from your build-system in your `/node_modules`.

Within your `webpack.config.js` you delegate to this package. However there are a number of options that you can set, and an API for customisation of the full configuration.

There are some structural [conventions](https://github.com//angularity/webpack-angularity-solution/wiki/conventions) that you need to follow. Any existing **Angularity** project satisfies these.

If you wish to build a similar system with different constraints, or for a platform other than **AngularJS 1.x**, you will find [webpack-multi-configurator](https://www.npmjs.com/package/webpack-multi-configurator) is where all the smarts are.

## Getting started

Please refer to the documentation:

 * [installation](https://github.com//angularity/webpack-angularity-solution/wiki/installation)
 * [conventions](https://github.com//angularity/webpack-angularity-solution/wiki/conventions)
 * [project setup](https://github.com//angularity/webpack-angularity-solution/wiki/project-setup)
 * [usage](https://github.com//angularity/webpack-angularity-solution/wiki/usage)
 * [troubleshooting](https://github.com//angularity/webpack-angularity-solution/wiki/troubleshooting)

## How it works

Please refer to the documentation:

 * [configuration](configuration) and the [options reference](options)
 * [extensibility](extensibility)
 * [how do I...?](how-do-i)
