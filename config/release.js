'use strict';

/**
 * Create a list of webpack configurators, one for each application detected.
 * @param {function():Config} factory A factory for the webpack-configurator
 * @param {{appDir:string, releaseDir:string, names:Array, globals:object, unminified:boolean, port:number}} options
 * @returns {Array.<Config>} A list of Webpack-configurator instances, one for each application detected
 */
function release(factory, options) {

  // lazy import packages
  var path             = require('path'),
      listCompositions = require('../lib/list-compositions'),
      appFilter        = require('../lib/app-filter');

  // there may be any number of compositions in subdirectories
  var list = listCompositions(options.appDir, 'release')
    .filter(appFilter(options.names));

  // ensure at least one composition or webpack will crash with a cryptic error
  if (list.length) {
    return list.map(eachComposition);
  }
  else {
    throw new Error('There are no compositions included in this build.');
  }

  function eachComposition(composition) {
    var releaseDir = path.join(options.releaseDir, composition.directory);
    return factory()
      .addClean(releaseDir)
      .addComposition(composition, options.publicPath)
      .addConditionals({
        TEST   : false,
        DEBUG  : false,
        RELEASE: true
      })
      .addExternalChunkManifest()
      .addMinification(!options.unminified)
      .merge({
        name  : composition.namespace.join('.'),
        output: {
          path      : path.resolve(releaseDir),
          publicPath: options.publicPath
        }
      });
  }
}

module.exports = release;