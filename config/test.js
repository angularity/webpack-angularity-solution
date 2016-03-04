'use strict';

var path = require('path');

/**
 * Create a single webpack configurator for test.
 * @param {function} configuratorFactory A factory for the webpack-configurator
 * @param {{appDir:string, testDir:string, globals:object, testGlob:string}} options An options hash
 * @returns {Config} A webpack configurator
 */
function test(configuratorFactory, options) {
  var testEntry = path.resolve(options.appDir, 'test.js');

  return configuratorFactory()
    .addClean(options.testDir)
    .addConditionals({
      TEST   : true,
      DEBUG  : true,
      RELEASE: false
    })
    .addTestSuiteGeneration(testEntry, options.testGlob)
    .merge({
      name  : 'test',
      entry : {
        test: testEntry
      },
      output: {
        path: path.resolve(options.testDir)
      }
    });
}

module.exports = test;