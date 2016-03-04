'use strict';

var multiConfigurator = require('webpack-multi-configurator');

var getConfiguratorFactory = require('./lib/get-configurator-factory');

const DEFAULT_OPTIONS = {
  appDir    : './app',
  buildDir  : './app-build',
  testDir   : './app-test',
  releaseDir: './app-release',
  testGlob  : '**/*.spec.js',
  port      : 55555,
  unminified: false,
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
 * @returns {{create:function, define:function, include:function, exclude:function, resolve:function}} A new instance
 */
function create(/*...options*/) {
  var options = Array.prototype.slice.call(arguments),
      factory = getConfiguratorFactory(OPERATORS);

  return multiConfigurator(DEFAULT_OPTIONS, factory)
    .create(options)
    .define('common', require('./config/common'))
    .define('app', 'common', require('./config/app'))
    .define('test', 'common', require('./config/test'))
    .define('release', 'common', require('./config/release'));
}

module.exports = create;