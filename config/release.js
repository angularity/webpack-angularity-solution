'use strict';

/**
 * Create a single webpack configurator for release.
 * @param {Config} configurator A webpack-configurator instance
 * @param {{appDir:string, releaseDir:string, globals:object, unminified:boolean, port:number}} options An options hash
 * @returns {Config} The given webpack-configurator instance
 */
function release(configurator, options) {

  // lazy import packages
  var path             = require('path'),
      listCompositions = require('../lib/list-compositions');

  // only the primary application will be released
  var composition = listCompositions(options.appDir)[0];
  if (composition) {
    return configurator
      .addBrowserSync(options.releaseDir, options.port)
      .addClean(options.releaseDir)
      .addComposition(composition, options.publicPath)
      .addConditionals({
        TEST   : false,
        DEBUG  : false,
        RELEASE: true
      })
      .addExternalChunkManifest()
      .addMinification(!options.unminified)
      .merge({
        name  : 'release',
        output: {
          path      : path.resolve(options.releaseDir),
          publicPath: options.publicPath
        }
      });
  }
  else {
    throw new Error('there are no compositions in the app directory');
  }
}

module.exports = release;