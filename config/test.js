'use strict';

var path = require('path');

var createConfigurator = require('../lib/create-configurator');

/**
 * Create a single webpack configurator for test.
 * @param {{appDir:string, testDir:string, globals:object, testGlob:string}} options An options hash
 * @returns {Config} A webpack configurator
 */
function test(options) {
  var testEntry = path.resolve(options.appDir, 'test.js');

  return createConfigurator({
    addCommon             : require('./add/common'),
    addConditionals       : require('./add/conditionals'),
    addTestSuiteGeneration: require('./add/test-suite-generation')
  })
    .addCommon(path.resolve(__dirname, '..', 'node_modules'), options)
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