'use strict';

var multiConfigurator = require('webpack-multi-configurator');

var configuratorFactory = require('./lib/configurator-factory');

const DEFAULT_OPTIONS = {
  appDir    : './app',
  buildDir  : './app-build',
  testDir   : './app-test',
  releaseDir: './app-release',
  testGlob  : '**/*.spec.js',
  port      : 55555,
  names     : 'app*, release',
  hashHtml  : 'release*',
  unminified: 'test',
  legacy    : true,
  publicPath: undefined,
  globals   : {},
  stats     : {
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
};

const OPERATORS = {
  addBrowserSync          : require('./config/add/browser-sync'),
  addClean                : require('./config/add/clean'),
  addComposition          : require('./config/add/composition'),
  addConditionals         : require('./config/add/conditionals'),
  addExternalChunkManifest: require('./config/add/external-chunk-manifest'),
  addMinification         : require('./config/add/minification'),
  addTestSuiteGeneration  : require('./config/add/test-suite-generation')
};

/**
 * Create a set of accessors that yield webpack configurator(s).
 * @param {...object} [options] Any number of options hashes to be merged, or single configurator factory method
 * @returns {function():{define:function, include:function, exclude:function, resolve:function}}
 */
module.exports = multiConfigurator(DEFAULT_OPTIONS, configuratorFactory(OPERATORS))
  .define('common')
    .append(require('./config/common'))
    .append(require('./config/legacy'))
  .define('app')
    .generate(require('./config/app'))
    .append('common')
  .define('release')
    .generate(require('./config/release'))
    .append('common')
  .define('test')
    .append(require('./config/test'))
    .append('common')
  .create;