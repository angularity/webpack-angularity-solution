'use strict';

/**
 * Create a list of webpack configurators, one for each application detected.
 * @param {function} configuratorFactory A factory for the webpack-configurator
 * @param {{appDir:string, buildDir:string, globals:object, unminified:boolean, port:number}} options An options hash
 * @returns {Array.<Config>} A list of configurators, one for each application detected
 */
function app(configuratorFactory, options) {

  // lazy import packages
  var path = require('path');
  var listCompositions = require('../lib/list-compositions');

  // there may be any number of compositions in subdirectories
  return listCompositions(options.appDir)
    .map(eachComposition);

  function eachComposition(composition, i) {
    var buildDir = path.join(options.buildDir, composition.directory),
        config   = configuratorFactory()
          .addClean(buildDir)
          .addComposition(composition)
          .addConditionals({
            TEST   : false,
            DEBUG  : true,
            RELEASE: false
          })
          .addMinification(!options.unminified)
          .merge({
            output: {
              path: path.resolve(buildDir)
            }
          });

    // we only need to create a server for the base composition
    return (i === 0) ? config.addBrowserSync(buildDir, options.port) : config;
  }
}

module.exports = app;