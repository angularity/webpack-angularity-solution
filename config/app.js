'use strict';

/**
 * Create a list of webpack configurators, one for each application detected.
 * @param {function():Config} factory A factory for the webpack-configurator
 * @param {{appDir:string, buildDir:string, names:Array, globals:object, unminified:boolean, port:number}} options
 * @returns {Array.<Config>} A list of Webpack-configurator instances, one for each application detected
 */
function app(factory, options) {

  // lazy import packages
  var path             = require('path'),
      listCompositions = require('../lib/list-compositions'),
      appFilter        = require('../lib/app-filter');

  // there may be any number of compositions in subdirectories
  var list = listCompositions(options.appDir, 'app')
    .filter(appFilter(options.names));

  // ensure at least one composition or webpack will crash with a cryptic error
  if (list.length) {
    return list.map(eachComposition);
  }
  else {
    throw new Error('There are no compositions included in this build.');
  }

  function eachComposition(composition, i) {
    var buildDir = path.join(options.buildDir, composition.directory),
        config   = factory()
          .addClean(buildDir)
          .addComposition(composition)
          .addConditionals({
            TEST   : false,
            DEBUG  : true,
            RELEASE: false
          })
          .addMinification(!options.unminified)
          .merge({
            name  : composition.namespace.join('.'),
            output: {
              path: path.resolve(buildDir)
            }
          });

    // we only need to create a server for the base composition
    return (i === 0) ? config.addBrowserSync(buildDir, options.port) : config;
  }
}

module.exports = app;