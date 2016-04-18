'use strict';

/**
 * Create a single webpack configurator for test.
 * @param {Config} configurator A webpack-configurator instance
 * @param {{appDir:string, testDir:string, globals:object, testGlob:string}} options An options hash
 * @returns {Config} The given webpack-configurator instance
 */
function test(configurator, options) {

  // lazy import packages
  var path      = require('path'),
      appFilter = require('../lib/app-filter');

  // generate an entry file for all tests
  var testEntry = path.resolve(options.appDir, 'test.js'),
      minify    = !appFilter(options.unminified)({namespace: 'test'});

  return configurator
    .addClean(options.testDir)
    .addConditionals({
      TEST   : true,
      DEBUG  : true,
      RELEASE: false
    })
    .addTestSuiteGeneration(testEntry, options.testGlob)
    .addMinification(minify)
    .merge({
      name  : 'test',
      entry : {
        test: testEntry
      },
      output: {
        filename     : '[name].js',
        chunkFilename: '[name].js',
        path         : path.resolve(options.testDir)
      }
    });
}

module.exports = test;