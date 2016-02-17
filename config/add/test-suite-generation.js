'use strict';

var EntryGeneratorPlugin = require('entry-generator-webpack-plugin');

/**
 * Locate all specification files and generate a file that require()s them all.
 * @this {Config} A webpack-configurator instance
 * @param {string} outputFile The file that will be written
 * @param {string} testGlob A glob for all specification files
 * @returns {Config} The given webpack-configurator instance
 */
function testSuiteGeneration(outputFile, testGlob) {
  return this
    .plugin('generate-test', EntryGeneratorPlugin, [
      outputFile,
      [
        EntryGeneratorPlugin.bowerDevDependenciesSource(),
        EntryGeneratorPlugin.globSource(testGlob, {
          ignore: '**/{node_modules,bower_components,app*}/**'
        })
      ]
    ]);
}

module.exports = testSuiteGeneration;