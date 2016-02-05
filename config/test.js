'use strict';

var path = require('path');

var createConfigurator = require('../lib/create-configurator');

// TODO doctag
function test(options) {
  var testEntry = path.resolve(options.appDir, 'test.js');

  return [
    createConfigurator({
      addCommon             : require('./add/common'),
      addConditionals       : require('./add/conditionals'),
      addTestSuiteGeneration: require('./add/test-suite-generation')
    })
      .addCommon(path.resolve(__dirname, '..', 'node_modules'), options.globals)
      .addConditionals({
        TEST   : true,
        DEBUG  : true,
        RELEASE: false
      })
      .addTestSuiteGeneration(testEntry, '**/*.spec.js')
      .merge({
        entry : {
          test: testEntry
        },
        output: {
          path: path.resolve(options.testDir)
        }
      })
  ];
}

module.exports = test;